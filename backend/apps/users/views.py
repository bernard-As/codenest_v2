# backend/apps/users/views.py
from rest_framework import generics, permissions, status,filters
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allow anyone to register
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "message": "User registered successfully. Please log in." 
                       # Or "Verification email sent." if implementing email verification
        }, status=status.HTTP_201_CREATED)

# Optional: View for current user details (requires authentication)
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('first_name', 'last_name')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated] # Only authenticated users can search others
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']