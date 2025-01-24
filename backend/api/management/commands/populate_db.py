from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Note
from faker import Faker
from django.utils import timezone
from django.db import transaction
import random
from datetime import timedelta
from django.db.models import Count

class Command(BaseCommand):
    help = 'Populates the database with dummy data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fresh',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **kwargs):
        fake = Faker()
        
        # Configuration - Updated for 1000 users
        NEW_USERS = 1000
        BATCH_SIZE = 100  # Increased batch size for better performance
        MIN_NOTES = 10
        MAX_NOTES = 50
        
        if kwargs['fresh']:
            self.stdout.write('Clearing existing data...')
            with transaction.atomic():
                Note.objects.all().delete()
                User.objects.filter(is_superuser=False).delete()
        
        existing_users = User.objects.count()
        self.stdout.write(f'Current user count: {existing_users}')
        self.stdout.write(f'Adding {NEW_USERS} new users...')
        
        # Track existing usernames to avoid duplicates
        existing_usernames = set(User.objects.values_list('username', flat=True))
        
        try:
            with transaction.atomic():
                total_notes_created = 0
                
                # Create users in batches
                for i in range(0, NEW_USERS, BATCH_SIZE):
                    user_batch = []
                    batch_size = min(BATCH_SIZE, NEW_USERS - i)
                    
                    self.stdout.write(f'Processing batch {i//BATCH_SIZE + 1} of {NEW_USERS//BATCH_SIZE + 1}...')
                    
                    for _ in range(batch_size):
                        while True:
                            first_name = fake.first_name()
                            last_name = fake.last_name()
                            username = f"{first_name.lower()}{last_name.lower()}{random.randint(1, 99999)}"
                            if username not in existing_usernames:
                                existing_usernames.add(username)
                                break
                        
                        email = f"{username}@{fake.free_email_domain()}"
                        
                        # Generate a random join date within the last 2 years
                        join_date = fake.date_time_between(
                            start_date='-2y',
                            end_date='now',
                            tzinfo=timezone.get_current_timezone()
                        )
                        
                        user = User(
                            username=username[:150],
                            email=email,
                            first_name=first_name,
                            last_name=last_name,
                            is_active=True,
                            date_joined=join_date
                        )
                        user.set_password('password123')
                        user_batch.append(user)
                    
                    # Bulk create users
                    created_users = User.objects.bulk_create(user_batch)
                    self.stdout.write(f'Created {len(created_users)} users')
                    
                    # Create notes for the batch of users
                    notes_batch = []
                    batch_notes_count = 0
                    
                    for user in created_users:
                        # Random number of notes for each user
                        num_notes = random.randint(MIN_NOTES, MAX_NOTES)
                        batch_notes_count += num_notes
                        
                        for _ in range(num_notes):
                            # Generate note timestamp between user join date and now
                            created_at = fake.date_time_between(
                                start_date=user.date_joined,
                                end_date='now',
                                tzinfo=timezone.get_current_timezone()
                            )
                            
                            # Randomly choose note type and content
                            note_type = random.choice(['paragraph', 'todo', 'meeting', 'idea'])
                            
                            if note_type == 'paragraph':
                                content = fake.paragraph(nb_sentences=random.randint(3, 8))
                                title = fake.sentence(nb_words=random.randint(4, 8))[:-1]
                            elif note_type == 'todo':
                                todos = [fake.sentence() for _ in range(random.randint(3, 7))]
                                content = "\n".join(f"- {todo}" for todo in todos)
                                title = "To-Do List: " + fake.words(nb=random.randint(2, 4))[0].title()
                            elif note_type == 'meeting':
                                attendees = [fake.name() for _ in range(random.randint(2, 5))]
                                content = f"Meeting Date: {fake.future_date().strftime('%Y-%m-%d')}\n"
                                content += f"Attendees: {', '.join(attendees)}\n\n"
                                content += fake.paragraph(nb_sentences=random.randint(2, 4))
                                title = f"Meeting Notes: {fake.company()}"
                            else:  # idea
                                content = f"💡 {fake.paragraph(nb_sentences=1)}\n\n"
                                content += fake.paragraph(nb_sentences=random.randint(2, 4))
                                title = "Idea: " + fake.catch_phrase()
                            
                            note = Note(
                                title=title[:100],
                                content=content,
                                created_at=created_at,
                                author=user
                            )
                            notes_batch.append(note)
                            
                            # Bulk create notes in smaller chunks to manage memory
                            if len(notes_batch) >= 2000:
                                Note.objects.bulk_create(notes_batch)
                                total_notes_created += len(notes_batch)
                                self.stdout.write(f'Created {len(notes_batch)} notes (Total: {total_notes_created})')
                                notes_batch = []
                    
                    # Create any remaining notes
                    if notes_batch:
                        Note.objects.bulk_create(notes_batch)
                        total_notes_created += len(notes_batch)
                        self.stdout.write(f'Created {len(notes_batch)} notes (Total: {total_notes_created})')
                    
                    self.stdout.write(f'Batch complete. Created {batch_notes_count} notes for {batch_size} users')
                
                # After creating all users and notes, verify the data
                self.stdout.write('Verifying note distribution...')
                user_note_counts = User.objects.filter(
                    date_joined__gte=timezone.now() - timedelta(hours=1)
                ).annotate(
                    note_count=Count('notes')
                ).values('username', 'note_count')

                users_without_notes = [u for u in user_note_counts if u['note_count'] < MIN_NOTES]
                users_with_excess_notes = [u for u in user_note_counts if u['note_count'] > MAX_NOTES]

                if users_without_notes:
                    self.stdout.write(self.style.WARNING(
                        f'Found {len(users_without_notes)} users with fewer than {MIN_NOTES} notes'
                    ))
                if users_with_excess_notes:
                    self.stdout.write(self.style.WARNING(
                        f'Found {len(users_with_excess_notes)} users with more than {MAX_NOTES} notes'
                    ))

                final_user_count = User.objects.count()
                final_note_count = Note.objects.count()
                avg_notes = Note.objects.filter(
                    author__date_joined__gte=timezone.now() - timedelta(hours=1)
                ).count() / NEW_USERS

                self.stdout.write(self.style.SUCCESS(
                    f'Database population complete!\n'
                    f'Total users: {final_user_count}\n'
                    f'Total notes: {final_note_count}\n'
                    f'Average notes per new user: {avg_notes:.1f}\n'
                    f'Note range per user: {MIN_NOTES}-{MAX_NOTES}\n'
                    f'Estimated total notes created: {total_notes_created}'
                ))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'An error occurred: {str(e)}'))
            raise e 