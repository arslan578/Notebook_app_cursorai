from rest_framework.routers import DefaultRouter
from django.urls import path
from . import views

router = DefaultRouter()
router.register(r'notes', views.NoteViewSet, basename='note')

urlpatterns = router.urls + [
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('dashboard/users/', views.user_stats, name='user-stats'),
    path('dashboard/notes-per-day/', views.notes_per_day, name='notes-per-day'),
    path('dashboard/notes-per-user/', views.notes_per_user, name='notes-per-user'),
]