from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, NoteSerializer, UserStatsSerializer, DailyNotesSerializer, NotesPerUserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .models import Note
from django.db.models import Count, Max, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    http_method_names = ['post']  # Only allow POST for user creation

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    # Get total counts
    total_users = User.objects.count()
    total_notes = Note.objects.count()
    
    return Response({
        'total_users': total_users,
        'total_notes': total_notes,
    })

@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_stats(request):
    users = User.objects.annotate(
        total_notes=Count('notes'),
        last_note_date=Max('notes__created_at')
    ).order_by('-total_notes')
    
    serializer = UserStatsSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def notes_per_day(request):
    days = int(request.GET.get('days', 30))  # Get days from query params, default to 30
    start_date = timezone.now() - timedelta(days=days)
    
    daily_notes = Note.objects.filter(
        created_at__gte=start_date
    ).annotate(
        date=TruncDate('created_at')
    ).values('date').annotate(
        count=Count('id')
    ).order_by('date')
    
    serializer = DailyNotesSerializer(daily_notes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def notes_per_user(request):
    notes_distribution = Note.objects.values(
        username=F('author__username')
    ).annotate(
        count=Count('id')
    ).order_by('-count')
    
    serializer = NotesPerUserSerializer(notes_distribution, many=True)
    return Response(serializer.data)