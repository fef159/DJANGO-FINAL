from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'first_name', 'last_name')

    def validate_email(self, value):
        """Validar que el email no esté en uso"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate_username(self, value):
        """Validar que el username no esté en uso"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs

    def create(self, validated_data):
        try:
            validated_data.pop('password_confirm')
            password = validated_data.pop('password')
            email = validated_data.pop('email')
            username = validated_data.pop('username', '')
            
            # Crear usuario usando create_user con keyword arguments
            # Cuando USERNAME_FIELD = 'email', debemos pasar email como keyword argument
            # o usar el método create directamente y luego set_password
            user = User(
                email=email,
                username=username,
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
            )
            user.set_password(password)
            user.save()
            return user
        except Exception as e:
            # Log del error para debugging
            import traceback
            print(f"Error al crear usuario: {e}")
            print(traceback.format_exc())
            raise serializers.ValidationError(f"Error al crear el usuario: {str(e)}")


class UserSerializer(serializers.ModelSerializer):
    date_joined = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'date_joined', 'created_at')
        read_only_fields = ('id', 'email', 'date_joined', 'created_at')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Usar email en lugar de username
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cambiar el campo username por email en el formulario
        if 'username' in self.fields:
            self.fields['email'] = self.fields.pop('username')
            self.fields['email'].label = 'Email'
    
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        
        # Obtener email y password
        email = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(
                'Debe incluir "email" y "password".',
                code='authorization'
            )
        
        # Autenticar usando email como username
        user = authenticate(request=self.context.get('request'), username=email, password=password)
        
        if not user:
            raise serializers.ValidationError(
                'No se encontró un usuario activo con las credenciales proporcionadas.',
                code='authorization'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'La cuenta de usuario está deshabilitada.',
                code='authorization'
            )
        
        # Generar tokens
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'email': user.email,
            'username': user.username,
        }
        
        return data
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['username'] = user.username
        return token

