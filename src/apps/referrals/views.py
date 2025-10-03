from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Sum
from django.utils import timezone
from .models import ReferralCode, Referral, ReferralCredit
from .serializers import (
    ReferralCodeSerializer,
    ReferralSerializer,
    ReferralCreditSerializer,
    ReferralStatsSerializer,
    ReferralTrackingSerializer
)
import uuid


class ReferralCodeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing referral codes"""
    serializer_class = ReferralCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReferralCode.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create or get existing referral code for user"""
        # Check if user already has a referral code
        referral_code, created = ReferralCode.objects.get_or_create(
            user=request.user
        )
        
        serializer = self.get_serializer(referral_code)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def my_code(self, request):
        """Get the current user's referral code"""
        referral_code, created = ReferralCode.objects.get_or_create(
            user=request.user
        )
        serializer = self.get_serializer(referral_code)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get detailed referral statistics"""
        try:
            referral_code = ReferralCode.objects.get(user=request.user)
        except ReferralCode.DoesNotExist:
            # Return empty stats if no referral code exists
            return Response({
                'total_clicks': 0,
                'total_signups': 0,
                'total_paid_referrals': 0,
                'total_credits_earned': 0,
                'available_credits': 0,
                'used_credits': 0,
                'conversion_rate': 0,
                'payment_rate': 0,
                'pending_credits': 0,
                'next_credit_progress': {
                    'current': 0,
                    'required': 2,
                    'percentage': 0
                }
            })
        
        # Calculate credits
        total_credits_earned = referral_code.paid_referrals // 2
        available_credits = ReferralCredit.get_available_credits(request.user)
        used_credits = ReferralCredit.objects.filter(
            user=request.user,
            status='used'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate pending credits (paid referrals not yet converted to credits)
        pending_referrals = referral_code.paid_referrals % 2
        
        # Next credit progress
        next_credit_progress = {
            'current': pending_referrals,
            'required': 2,
            'percentage': (pending_referrals / 2) * 100
        }
        
        stats = {
            'total_clicks': referral_code.clicks,
            'total_signups': referral_code.signups,
            'total_paid_referrals': referral_code.paid_referrals,
            'total_credits_earned': total_credits_earned,
            'available_credits': available_credits,
            'used_credits': used_credits,
            'conversion_rate': referral_code.conversion_rate,
            'payment_rate': referral_code.payment_rate,
            'pending_credits': pending_referrals,
            'next_credit_progress': next_credit_progress
        }
        
        serializer = ReferralStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def referrals(self, request):
        """Get list of all referrals for current user"""
        try:
            referral_code = ReferralCode.objects.get(user=request.user)
        except ReferralCode.DoesNotExist:
            return Response([])
        
        referrals = Referral.objects.filter(
            referral_code=referral_code
        ).order_by('-clicked_at')
        
        serializer = ReferralSerializer(referrals, many=True)
        return Response(serializer.data)


class ReferralCreditViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing referral credits"""
    serializer_class = ReferralCreditSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReferralCredit.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get count of available credits"""
        count = ReferralCredit.get_available_credits(request.user)
        return Response({'available_credits': count})


@api_view(['POST'])
@permission_classes([AllowAny])
def track_referral_click(request):
    """Public endpoint to track referral link clicks"""
    serializer = ReferralTrackingSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    code = serializer.validated_data['code']
    
    try:
        referral_code = ReferralCode.objects.get(code=code, is_active=True)
    except ReferralCode.DoesNotExist:
        return Response(
            {'error': 'Invalid referral code'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create referral tracking entry
    tracking_cookie = str(uuid.uuid4())
    
    referral = Referral.objects.create(
        referral_code=referral_code,
        ip_address=serializer.validated_data.get('ip_address'),
        user_agent=serializer.validated_data.get('user_agent'),
        tracking_cookie=tracking_cookie,
        status='pending'
    )
    
    # Increment click count
    referral_code.clicks += 1
    referral_code.save()
    
    return Response({
        'success': True,
        'tracking_cookie': tracking_cookie,
        'referrer_name': referral_code.user.get_full_name() or referral_code.user.email.split('@')[0]
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def validate_referral_code(request, code):
    """Public endpoint to validate a referral code"""
    try:
        referral_code = ReferralCode.objects.get(code=code, is_active=True)
        return Response({
            'valid': True,
            'referrer_name': referral_code.user.get_full_name() or referral_code.user.email.split('@')[0]
        })
    except ReferralCode.DoesNotExist:
        return Response(
            {'valid': False, 'error': 'Invalid referral code'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def link_referral_to_user(request):
    """Link a tracking cookie to a newly registered user"""
    tracking_cookie = request.data.get('tracking_cookie')
    
    if not tracking_cookie:
        return Response(
            {'error': 'tracking_cookie is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find the referral by tracking cookie
        referral = Referral.objects.get(
            tracking_cookie=tracking_cookie,
            referred_user__isnull=True
        )
        
        # Link to current user
        referral.mark_signed_up(request.user)
        
        return Response({
            'success': True,
            'message': 'Referral linked successfully'
        })
    except Referral.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired tracking cookie'},
            status=status.HTTP_404_NOT_FOUND
        )
