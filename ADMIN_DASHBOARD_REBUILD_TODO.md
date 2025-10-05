# 🎯 ADMIN/STAFF DASHBOARD REBUILD - TODO LIST

**Implementation Strategy:** Obscured Path (control-panel)  
**Start Date:** October 4, 2025  
**Target Completion:** November 1, 2025

---

## 📊 PROGRESS OVERVIEW

- **Phase 1 (Security):** 9/12 ✓ (75% complete)
- **Phase 2 (Permissions):** 2/7 ✓ (29% complete)
- **Phase 3 (Feature Parity):** 0/24 ✗
- **Phase 4 (Audit Logging):** 0/4 ✗
- **Phase 5 (Testing):** 0/15 ✗

**Total Progress:** 11/62 tasks (18%)

---

## 🔐 PHASE 1: SECURITY HARDENING (P0 - CRITICAL)

### Backend Security (Week 1)

#### 1.1 Update Admin URL Routes

- [ ] **Task:** Change Django admin URL from `/admin/` to `/control-panel/`
- **File:** `music_distribution_backend/urls.py`
- **Change:**
  ```python
  # OLD: path('admin/', admin.site.urls)
  # NEW: path('control-panel/', admin.site.urls)
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.2 Update Admin API Routes

- [ ] **Task:** Change API admin routes from `/api/admin/` to `/api/cp/`
- **File:** `src/apps/admin_dashboard/urls.py`
- **Change:**
  ```python
  # In main urls.py
  # OLD: path('', include('src.apps.admin_dashboard.urls'))
  # NEW: path('api/cp/', include('src.apps.admin_dashboard.urls'))
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.3 Create Permission Classes

- [ ] **Task:** Create `IsAdminOnly` and `IsStaffReadOnly` permission classes
- **File:** `src/apps/admin_dashboard/permissions.py` (NEW FILE)
- **Code:**

  ```python
  from rest_framework import permissions

  class IsAdminOrStaff(permissions.BasePermission):
      """Allow access to admin and staff users"""
      def has_permission(self, request, view):
          return request.user.is_authenticated and (
              request.user.role in ['admin', 'staff'] or
              request.user.is_staff or
              request.user.is_superuser
          )

  class IsAdminOnly(permissions.BasePermission):
      """Allow access only to admin users"""
      def has_permission(self, request, view):
          return request.user.is_authenticated and (
              request.user.role == 'admin' or
              request.user.is_superuser
          )

  class IsStaffReadOnly(permissions.BasePermission):
      """Staff can only read, admins can do everything"""
      def has_permission(self, request, view):
          user = request.user
          if not user.is_authenticated:
              return False

          # Admins and superusers can do anything
          if user.role == 'admin' or user.is_superuser:
              return True

          # Staff can only read
          if user.role == 'staff':
              return request.method in permissions.SAFE_METHODS

          return False
  ```

- **Priority:** P0
- **Estimated Time:** 15 minutes
- **Status:** ❌ Not Started

#### 1.4 Re-enable Permissions on AdminDashboardViewSet

- [ ] **Task:** Enable `IsAdminOrStaff` permission on dashboard stats
- **File:** `src/apps/admin_dashboard/views.py`
- **Change:**

  ```python
  from .permissions import IsAdminOrStaff, IsAdminOnly, IsStaffReadOnly

  class AdminDashboardViewSet(viewsets.ViewSet):
      permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
  ```

- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.5 Re-enable Permissions on UserManagementViewSet

- [ ] **Task:** Enable `IsAdminOnly` permission (staff can't edit users)
- **File:** `src/apps/admin_dashboard/views.py`
- **Change:**
  ```python
  class UserManagementViewSet(viewsets.ModelViewSet):
      permission_classes = [permissions.IsAuthenticated, IsStaffReadOnly]
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.6 Re-enable Permissions on ContentManagementViewSet

- [ ] **Task:** Enable `IsAdminOrStaff` (staff can approve songs)
- **File:** `src/apps/admin_dashboard/views.py`
- **Change:**
  ```python
  class ContentManagementViewSet(viewsets.ModelViewSet):
      permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.7 Re-enable Permissions on SystemSettingsViewSet

- [ ] **Task:** Enable `IsAdminOnly` (staff can't change settings)
- **File:** `src/apps/admin_dashboard/views.py`
- **Change:**
  ```python
  class SystemSettingsViewSet(viewsets.ModelViewSet):
      permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.8 Re-enable Permissions on BulkNotificationViewSet

- [ ] **Task:** Enable `IsAdminOnly` (prevent notification abuse)
- **File:** `src/apps/admin_dashboard/views.py`
- **Change:**
  ```python
  class BulkNotificationViewSet(viewsets.ModelViewSet):
      permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

### Frontend Security (Week 1)

#### 1.9 Update Admin Route in App.jsx

- [ ] **Task:** Change route from `/admin/*` to `/control-panel/*`
- **File:** `frontend/src/App.jsx`
- **Change:**
  ```jsx
  // OLD: <Route path="/admin/*" element={...} />
  // NEW: <Route path="/control-panel/*" element={...} />
  ```
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

#### 1.10 Update Admin Navigation Links

- [ ] **Task:** Update all links pointing to `/admin` to `/control-panel`
- **Files to check:**
  - `frontend/src/components/Layout.jsx`
  - `frontend/src/components/Navbar.jsx`
  - `frontend/src/pages/Dashboard.jsx`
  - Any component with admin links
- **Priority:** P0
- **Estimated Time:** 15 minutes
- **Status:** ❌ Not Started

#### 1.11 Update API Base URLs

- [ ] **Task:** Update API calls from `/api/admin/` to `/api/cp/`
- **File:** `frontend/src/services/api.js` or component files
- **Change:**
  ```javascript
  // OLD: const API_BASE = '/api/admin'
  // NEW: const API_BASE = '/api/cp'
  ```
- **Priority:** P0
- **Estimated Time:** 10 minutes
- **Status:** ❌ Not Started

#### 1.12 Test Admin Access

- [ ] **Task:** Verify old `/admin` route returns 404 and new route works
- **Testing Steps:**
  1. Try accessing `http://localhost:8000/admin/` → should fail
  2. Access `http://localhost:8000/control-panel/` → should work
  3. Verify React app loads at `http://localhost:5173/control-panel`
- **Priority:** P0
- **Estimated Time:** 10 minutes
- **Status:** ❌ Not Started

---

## 🔑 PHASE 2: STAFF PERMISSION SYSTEM (P0)

### Backend Permissions (Week 2)

#### 2.1 Update User Model Properties

- [ ] **Task:** Add separate `is_staff_user` property to User model
- **File:** `src/apps/users/models.py`
- **Change:**

  ```python
  @property
  def is_admin_user(self):
      return self.role == 'admin' or self.is_superuser

  @property
  def is_staff_user(self):
      return self.role == 'staff' and not self.is_superuser
  ```

- **Priority:** P0
- **Estimated Time:** 10 minutes
- **Status:** ❌ Not Started

#### 2.2 Add Action-Level Permissions to ContentManagement

- [ ] **Task:** Add specific permissions for approve/reject vs delete songs
- **File:** `src/apps/admin_dashboard/views.py`
- **Code:**

  ```python
  from rest_framework.decorators import action

  class ContentManagementViewSet(viewsets.ModelViewSet):
      @action(methods=['post'], detail=True, permission_classes=[IsAdminOrStaff])
      def approve_song(self, request, pk=None):
          """Staff can approve songs"""
          # Implementation

      @action(methods=['post'], detail=True, permission_classes=[IsAdminOrStaff])
      def reject_song(self, request, pk=None):
          """Staff can reject songs"""
          # Implementation

      @action(methods=['delete'], detail=True, permission_classes=[IsAdminOnly])
      def delete_song(self, request, pk=None):
          """Only admins can delete songs"""
          # Implementation
  ```

- **Priority:** P0
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 2.3 Filter Dashboard Stats by Role

- [ ] **Task:** Hide sensitive financial data from staff users
- **File:** `src/apps/admin_dashboard/views.py`
- **Change:**

  ```python
  @action(detail=False, methods=['get'])
  def stats(self, request):
      user = request.user
      stats = {
          'total_users': User.objects.count(),
          'total_songs': Song.objects.count(),
          'pending_songs': Song.objects.filter(status='pending_approval').count(),
          'distributed_songs': Song.objects.filter(status='distributed').count(),
      }

      # Financial data only for admins
      if user.role == 'admin' or user.is_superuser:
          stats['total_revenue'] = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
          stats['pending_payouts'] = Payout.objects.filter(status='pending').count()
          stats['monthly_revenue'] = self._get_monthly_revenue()

      return Response(stats)
  ```

- **Priority:** P0
- **Estimated Time:** 20 minutes
- **Status:** ❌ Not Started

### Frontend Permissions (Week 2)

#### 2.4 Create Permission Utility Functions

- [ ] **Task:** Create centralized permission checking utility
- **File:** `frontend/src/utils/permissions.js` (NEW FILE)
- **Code:**

  ```javascript
  /**
   * Check if user can perform a specific action
   */
  export const canPerformAction = (user, action) => {
    if (!user) return false;
    if (user.is_superuser) return true;

    const permissions = {
      // Dashboard
      view_dashboard: ["admin", "staff"],

      // Users
      view_users: ["admin", "staff"],
      edit_users: ["admin"],
      delete_users: ["admin"],
      verify_artists: ["admin"],

      // Songs
      view_songs: ["admin", "staff"],
      approve_songs: ["admin", "staff"],
      reject_songs: ["admin", "staff"],
      delete_songs: ["admin"],

      // Analytics
      view_analytics: ["admin", "staff"],
      export_analytics: ["admin"],
      view_financial_data: ["admin"],

      // Support
      view_tickets: ["admin", "staff"],
      respond_to_tickets: ["admin", "staff"],
      assign_tickets: ["admin"],
      close_tickets: ["admin"],

      // Settings
      manage_settings: ["admin"],
      send_bulk_notifications: ["admin"],

      // Audit
      view_audit_logs: ["admin", "staff"],
      view_all_audit_logs: ["admin"],
    };

    const allowedRoles = permissions[action] || [];
    return allowedRoles.includes(user.role);
  };

  /**
   * Check if user has specific role
   */
  export const hasRole = (user, role) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.role === role;
  };

  /**
   * Check if user is admin
   */
  export const isAdmin = (user) => {
    return user && (user.role === "admin" || user.is_superuser);
  };

  /**
   * Check if user is staff
   */
  export const isStaff = (user) => {
    return user && user.role === "staff";
  };
  ```

- **Priority:** P0
- **Estimated Time:** 20 minutes
- **Status:** ❌ Not Started

#### 2.5 Update AdminSidebar with Role-Based Navigation

- [ ] **Task:** Filter navigation items based on user role
- **File:** `frontend/src/admin/components/AdminSidebar.jsx`
- **Change:**

  ```jsx
  import { canPerformAction } from "../../utils/permissions";

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "",
      permission: "view_dashboard",
    },
    { icon: Users, label: "Users", href: "users", permission: "view_users" },
    {
      icon: CheckCircle,
      label: "Song Approval",
      href: "songs",
      permission: "view_songs",
    },
    {
      icon: Shield,
      label: "Artist Verification",
      href: "artists",
      permission: "verify_artists",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "analytics",
      permission: "view_analytics",
    },
    {
      icon: DollarSign,
      label: "Revenue",
      href: "revenue",
      permission: "view_analytics",
    },
    {
      icon: Wallet,
      label: "Financial",
      href: "financial",
      permission: "view_financial_data",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "settings",
      permission: "manage_settings",
    },
    {
      icon: FileText,
      label: "Audit Logs",
      href: "audit",
      permission: "view_audit_logs",
    },
    {
      icon: MessageSquare,
      label: "Support",
      href: "support",
      permission: "view_tickets",
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    canPerformAction(currentUser, item.permission)
  );
  ```

- **Priority:** P0
- **Estimated Time:** 15 minutes
- **Status:** ❌ Not Started

#### 2.6 Add Permission Checks to UserManagement Component

- [ ] **Task:** Hide edit/delete buttons from staff users
- **File:** `frontend/src/admin/components/UserManagement.jsx`
- **Change:**

  ```jsx
  import { canPerformAction } from "../../utils/permissions";

  function UserManagement({ currentUser }) {
    return (
      <div>
        {/* View always available */}
        <UserTable users={users} />

        {/* Edit only for admins */}
        {canPerformAction(currentUser, "edit_users") && (
          <button onClick={handleEdit}>Edit User</button>
        )}

        {/* Delete only for admins */}
        {canPerformAction(currentUser, "delete_users") && (
          <button onClick={handleDelete} className="text-red-600">
            Delete User
          </button>
        )}
      </div>
    );
  }
  ```

- **Priority:** P0
- **Estimated Time:** 20 minutes
- **Status:** ❌ Not Started

#### 2.7 Add Permission Checks to SongApprovalPanel

- [ ] **Task:** Show approve/reject for staff, hide delete
- **File:** `frontend/src/admin/components/SongApprovalPanel.jsx`
- **Change:**

  ```jsx
  import { canPerformAction } from "../../utils/permissions";

  function SongApprovalPanel({ currentUser }) {
    return (
      <div>
        {/* Approve/Reject for admin and staff */}
        {canPerformAction(currentUser, "approve_songs") && (
          <>
            <button onClick={handleApprove} className="bg-green-600">
              Approve
            </button>
            <button onClick={handleReject} className="bg-red-600">
              Reject
            </button>
          </>
        )}

        {/* Delete only for admins */}
        {canPerformAction(currentUser, "delete_songs") && (
          <button onClick={handleDelete} className="text-red-700">
            Delete Song
          </button>
        )}
      </div>
    );
  }
  ```

- **Priority:** P0
- **Estimated Time:** 15 minutes
- **Status:** ❌ Not Started

---

## ⚙️ PHASE 3: FEATURE PARITY WITH DJANGO ADMIN (P1)

### User Management Features (Week 3)

#### 3.1 Implement User List with Filters

- [ ] **Task:** Add filters for role, subscription, verification status
- **File:** `frontend/src/admin/components/UserManagement.jsx`
- **Features:**
  - Dropdown filters for role
  - Subscription tier filter
  - Verified/unverified toggle
  - Date range filter
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.2 Implement User Search

- [ ] **Task:** Add search by email, username, or ID
- **File:** `frontend/src/admin/components/UserManagement.jsx`
- **Features:**
  - Real-time search
  - Debounced API calls
  - Search results highlighting
- **Priority:** P1
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 3.3 Implement Bulk User Actions

- [ ] **Task:** Add bulk operations (verify artists, upgrade subscriptions)
- **File:** `frontend/src/admin/components/UserManagement.jsx`
- **Features:**
  - Checkbox selection
  - Bulk verify artists
  - Bulk upgrade subscriptions
  - Bulk activate/deactivate accounts
- **Priority:** P1
- **Estimated Time:** 1.5 hours
- **Status:** ❌ Not Started

#### 3.4 Create User Detail Modal

- [ ] **Task:** Show detailed user info in modal with inline editing
- **File:** `frontend/src/admin/components/UserDetailModal.jsx` (NEW)
- **Features:**
  - User profile info
  - Activity history
  - Subscription details
  - Inline field editing (admin only)
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Status:** ❌ Not Started

#### 3.5 Add User Activity Logs

- [ ] **Task:** Show recent user actions (uploads, payments, etc.)
- **File:** `frontend/src/admin/components/UserDetailModal.jsx`
- **Features:**
  - Last login timestamp
  - Recent songs uploaded
  - Payment history
  - Support tickets
- **Priority:** P2
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

### Song Management Features (Week 3)

#### 3.6 Implement Song List with Filters

- [ ] **Task:** Add filters for status, artist, distribution
- **File:** `frontend/src/admin/components/SongApprovalPanel.jsx`
- **Features:**
  - Status filter (pending, approved, rejected, distributed)
  - Artist filter
  - Date range
  - Genre filter
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.7 Implement Song Approval Workflow

- [ ] **Task:** Add approve/reject with admin notes
- **File:** `frontend/src/admin/components/SongApprovalPanel.jsx`
- **Features:**
  - Approve button with confirmation
  - Reject with reason textarea
  - Admin notes field
  - Email notification on status change
- **Priority:** P1
- **Estimated Time:** 1.5 hours
- **Status:** ❌ Not Started

#### 3.8 Implement Bulk Song Actions

- [ ] **Task:** Add bulk approve/reject functionality
- **File:** `frontend/src/admin/components/SongApprovalPanel.jsx`
- **Features:**
  - Select multiple songs
  - Bulk approve
  - Bulk reject with shared reason
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.9 Add Distribution History View

- [ ] **Task:** Show distribution timeline for each song
- **File:** `frontend/src/admin/components/SongDetailModal.jsx` (NEW)
- **Features:**
  - Timeline of status changes
  - Platform distribution links
  - Distribution analytics
- **Priority:** P2
- **Estimated Time:** 1.5 hours
- **Status:** ❌ Not Started

#### 3.10 Add Song Preview

- [ ] **Task:** Preview artwork and metadata in modal
- **File:** `frontend/src/admin/components/SongDetailModal.jsx`
- **Features:**
  - Album artwork display
  - Audio preview player
  - Metadata display (title, artist, genre, etc.)
  - Edit metadata (admin only)
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

### Support System Features (Week 3)

#### 3.11 Implement Contact Message List

- [ ] **Task:** List contact messages with filters
- **File:** `frontend/src/admin/components/SupportCommunications.jsx`
- **Features:**
  - Status filter (new, read, in_progress, responded, resolved)
  - Priority filter
  - Category filter
  - Search by name/email
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.12 Implement Contact to Ticket Conversion

- [ ] **Task:** Add button to convert contact message to support ticket
- **File:** `frontend/src/admin/components/SupportCommunications.jsx`
- **Features:**
  - Convert to ticket button
  - Auto-fill ticket fields from contact message
  - Link ticket to original message
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.13 Implement Ticket Assignment

- [ ] **Task:** Allow assigning tickets to staff members
- **File:** `frontend/src/admin/components/SupportCommunications.jsx`
- **Features:**
  - Staff member dropdown
  - Auto-assign based on workload
  - Notification to assigned staff
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.14 Implement Ticket Reply System

- [ ] **Task:** Add reply interface with email notifications
- **File:** `frontend/src/admin/components/TicketReplyModal.jsx` (NEW)
- **Features:**
  - Rich text editor for replies
  - Email notification checkbox
  - Attach files
  - Reply history
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Status:** ❌ Not Started

#### 3.15 Implement Ticket Status Management

- [ ] **Task:** Add resolve/close ticket functionality
- **File:** `frontend/src/admin/components/SupportCommunications.jsx`
- **Features:**
  - Mark as resolved (admin only)
  - Close ticket (admin only)
  - Reopen ticket
  - Status change log
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.16 Add Ticket Response History

- [ ] **Task:** Show all replies and status changes
- **File:** `frontend/src/admin/components/TicketDetailModal.jsx` (NEW)
- **Features:**
  - Timeline of all replies
  - Status change history
  - Staff member attribution
  - Timestamps
- **Priority:** P1
- **Estimated Time:** 1.5 hours
- **Status:** ❌ Not Started

### Analytics Dashboard (Week 3)

#### 3.17 Implement Real-Time Stats Cards

- [ ] **Task:** Create stat cards for overview metrics
- **File:** `frontend/src/admin/components/DashboardCards.jsx`
- **Features:**
  - Total users (with growth %)
  - Total songs (by status)
  - Total revenue (admin only)
  - Active subscriptions
  - Pending approvals
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.18 Implement Chart.js Graphs

- [ ] **Task:** Add trend charts for key metrics
- **File:** `frontend/src/admin/components/PlatformAnalytics.jsx`
- **Features:**
  - User growth over time (line chart)
  - Revenue by month (bar chart)
  - Songs by status (pie chart)
  - Subscription distribution (donut chart)
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Status:** ❌ Not Started

#### 3.19 Implement Data Export (Admin Only)

- [ ] **Task:** Add CSV export functionality
- **File:** `frontend/src/admin/components/PlatformAnalytics.jsx`
- **Features:**
  - Export user data
  - Export song data
  - Export payment data
  - Date range selection
  - Admin-only button
- **Priority:** P2
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.20 Add Date Range Filters

- [ ] **Task:** Add date picker for analytics
- **File:** `frontend/src/admin/components/PlatformAnalytics.jsx`
- **Features:**
  - Date range picker
  - Preset ranges (today, this week, this month, this year)
  - Custom range selection
  - Apply to all charts
- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

### Settings Management (Week 3)

#### 3.21 Implement Platform Settings Editor

- [ ] **Task:** Create settings form for commission rates, upload limits
- **File:** `frontend/src/admin/components/SystemSettings.jsx`
- **Features:**
  - Commission rate input
  - Upload limit settings
  - File size limits
  - Allowed file formats
  - Admin-only editing
- **Priority:** P1
- **Estimated Time:** 1.5 hours
- **Status:** ❌ Not Started

#### 3.22 Implement Email Template Editor

- [ ] **Task:** Add rich text editor for email templates
- **File:** `frontend/src/admin/components/SystemSettings.jsx`
- **Features:**
  - Template selection dropdown
  - Rich text editor
  - Variable placeholders guide
  - Preview functionality
  - Save/revert changes
- **Priority:** P2
- **Estimated Time:** 2 hours
- **Status:** ❌ Not Started

#### 3.23 Add Notification Preferences

- [ ] **Task:** Global notification settings
- **File:** `frontend/src/admin/components/SystemSettings.jsx`
- **Features:**
  - Enable/disable notification types
  - Email vs in-app toggle
  - Notification frequency
- **Priority:** P2
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 3.24 Add Maintenance Mode Toggle

- [ ] **Task:** Enable/disable site maintenance mode
- **File:** `frontend/src/admin/components/SystemSettings.jsx`
- **Features:**
  - Toggle switch
  - Maintenance message editor
  - Scheduled maintenance option
  - Superuser-only access
- **Priority:** P2
- **Estimated Time:** 1.5 hours
- **Status:** ❌ Not Started

---

## 📝 PHASE 4: AUDIT LOGGING IMPLEMENTATION (P1)

### Backend Audit System (Week 4)

#### 4.1 Update AdminAction Model

- [ ] **Task:** Enhance AdminAction model with detailed fields
- **File:** `src/apps/admin_dashboard/models.py`
- **Changes:**

  ```python
  class AdminAction(models.Model):
      ACTION_TYPES = [
          ('user_created', 'User Created'),
          ('user_updated', 'User Updated'),
          ('user_deleted', 'User Deleted'),
          ('user_verified', 'User Verified'),
          ('song_approved', 'Song Approved'),
          ('song_rejected', 'Song Rejected'),
          ('song_deleted', 'Song Deleted'),
          ('ticket_created', 'Ticket Created'),
          ('ticket_assigned', 'Ticket Assigned'),
          ('ticket_responded', 'Ticket Responded'),
          ('ticket_resolved', 'Ticket Resolved'),
          ('settings_changed', 'Settings Changed'),
          ('bulk_notification_sent', 'Bulk Notification Sent'),
      ]

      admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
      action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
      target_model = models.CharField(max_length=50)
      target_id = models.CharField(max_length=255)
      details = models.JSONField(default=dict)
      ip_address = models.GenericIPAddressField(null=True)
      timestamp = models.DateTimeField(auto_now_add=True)
  ```

- **Priority:** P1
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 4.2 Create Audit Logging Decorator

- [ ] **Task:** Create reusable decorator for auto-logging
- **File:** `src/apps/admin_dashboard/decorators.py` (NEW)
- **Code:**

  ```python
  from functools import wraps
  from .models import AdminAction

  def log_admin_action(action_type, target_model):
      def decorator(func):
          @wraps(func)
          def wrapper(viewset_instance, request, *args, **kwargs):
              response = func(viewset_instance, request, *args, **kwargs)

              if response.status_code < 400:
                  AdminAction.objects.create(
                      admin=request.user,
                      action_type=action_type,
                      target_model=target_model,
                      target_id=kwargs.get('pk', ''),
                      details=request.data,
                      ip_address=request.META.get('REMOTE_ADDR')
                  )

              return response
          return wrapper
      return decorator
  ```

- **Priority:** P1
- **Estimated Time:** 20 minutes
- **Status:** ❌ Not Started

#### 4.3 Apply Audit Logging to ViewSets

- [ ] **Task:** Add decorators to all admin actions
- **File:** `src/apps/admin_dashboard/views.py`
- **Changes:**

  ```python
  from .decorators import log_admin_action

  class UserManagementViewSet(viewsets.ModelViewSet):
      @log_admin_action('user_updated', 'User')
      def update(self, request, *args, **kwargs):
          return super().update(request, *args, **kwargs)

      @log_admin_action('user_deleted', 'User')
      def destroy(self, request, *args, **kwargs):
          return super().destroy(request, *args, **kwargs)
  ```

- **Priority:** P1
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

### Frontend Audit UI (Week 4)

#### 4.4 Create AuditLogs Component

- [ ] **Task:** Build audit log viewer with filters
- **File:** `frontend/src/admin/components/AuditLogs.jsx`
- **Features:**
  - Filterable table (admin name, action type, date)
  - Detail modal showing before/after values
  - Export audit log (admin only)
  - Staff can only see their own actions
  - Pagination
  - Search functionality
- **Priority:** P1
- **Estimated Time:** 2 hours
- **Status:** ❌ Not Started

---

## 🧪 PHASE 5: TESTING & VALIDATION (P2)

### Backend Tests (Week 4)

#### 5.1 Test IsAdminOnly Permission Class

- [ ] **Task:** Write unit tests for admin-only permission
- **File:** `src/apps/admin_dashboard/tests/test_permissions.py` (NEW)
- **Test Cases:**
  - Admin user can access
  - Staff user is denied
  - Regular user is denied
  - Unauthenticated user is denied
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.2 Test IsStaffReadOnly Permission Class

- [ ] **Task:** Write tests for staff read-only access
- **File:** `src/apps/admin_dashboard/tests/test_permissions.py`
- **Test Cases:**
  - Staff can GET but not POST/PUT/DELETE
  - Admin can perform all operations
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.3 Test Staff Cannot Delete/Modify Users

- [ ] **Task:** Integration test for user management restrictions
- **File:** `src/apps/admin_dashboard/tests/test_user_management.py` (NEW)
- **Test Cases:**
  - Staff GET request succeeds
  - Staff POST/PUT/DELETE requests fail with 403
  - Admin requests all succeed
- **Priority:** P2
- **Estimated Time:** 45 minutes
- **Status:** ❌ Not Started

#### 5.4 Test Staff Can Approve/Reject Songs

- [ ] **Task:** Test song approval permissions
- **File:** `src/apps/admin_dashboard/tests/test_content_management.py` (NEW)
- **Test Cases:**
  - Staff can call approve_song action
  - Staff can call reject_song action
  - Staff cannot call delete_song action
  - Admin can perform all song operations
- **Priority:** P2
- **Estimated Time:** 45 minutes
- **Status:** ❌ Not Started

#### 5.5 Test Audit Logging Creates Records

- [ ] **Task:** Verify decorator logs all actions
- **File:** `src/apps/admin_dashboard/tests/test_audit_logging.py` (NEW)
- **Test Cases:**
  - User update creates AdminAction record
  - Record contains correct action_type
  - Record captures IP address
  - Failed requests don't create logs
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.6 Test Old Admin Route is Inaccessible

- [ ] **Task:** Verify `/admin/` returns 404
- **File:** `src/apps/admin_dashboard/tests/test_routes.py` (NEW)
- **Test Cases:**
  - GET /admin/ returns 404
  - GET /control-panel/ returns 200
  - GET /api/admin/ returns 404
  - GET /api/cp/ returns 200 (with auth)
- **Priority:** P2
- **Estimated Time:** 20 minutes
- **Status:** ❌ Not Started

### Frontend Tests (Week 4)

#### 5.7 Test Role-Based Component Rendering

- [ ] **Task:** Test components hide/show based on role
- **File:** `frontend/src/admin/components/__tests__/UserManagement.test.jsx` (NEW)
- **Test Cases:**
  - Admin sees edit/delete buttons
  - Staff doesn't see edit/delete buttons
  - Both see view button
- **Priority:** P2
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 5.8 Test Staff Cannot See Admin Routes

- [ ] **Task:** Test sidebar filters routes by permission
- **File:** `frontend/src/admin/components/__tests__/AdminSidebar.test.jsx` (NEW)
- **Test Cases:**
  - Staff doesn't see "Settings" link
  - Staff doesn't see "Financial" link
  - Admin sees all links
- **Priority:** P2
- **Estimated Time:** 45 minutes
- **Status:** ❌ Not Started

#### 5.9 Test Permission Utility Functions

- [ ] **Task:** Unit tests for canPerformAction()
- **File:** `frontend/src/utils/__tests__/permissions.test.js` (NEW)
- **Test Cases:**
  - Admin can perform admin-only actions
  - Staff cannot perform admin-only actions
  - Staff can perform staff-allowed actions
  - Superuser can perform all actions
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.10 Test Admin Path from Environment

- [ ] **Task:** Test route configuration uses env variable
- **File:** `frontend/src/__tests__/App.test.jsx`
- **Test Cases:**
  - App renders admin route at correct path
  - Old /admin route doesn't exist
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

### Manual Testing (Week 4)

#### 5.11 Test Staff User Access

- [ ] **Task:** Manual test with staff account
- **Steps:**
  1. Create staff user account
  2. Login to control panel
  3. Verify can view dashboard
  4. Verify can approve songs
  5. Verify cannot access settings
  6. Verify cannot edit users
  7. Verify cannot see financial data
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.12 Test Admin User Access

- [ ] **Task:** Manual test with admin account
- **Steps:**
  1. Login as admin
  2. Verify all routes visible
  3. Verify can edit users
  4. Verify can change settings
  5. Verify can see financial data
  6. Verify can export analytics
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.13 Test Superuser Access

- [ ] **Task:** Manual test with superuser
- **Steps:**
  1. Login as superuser
  2. Verify access to all features
  3. Verify maintenance mode toggle works
  4. Verify dangerous operations are available
- **Priority:** P2
- **Estimated Time:** 20 minutes
- **Status:** ❌ Not Started

#### 5.14 Test Old Admin Route Fails

- [ ] **Task:** Verify old routes return errors
- **Steps:**
  1. Navigate to http://localhost:8000/admin/
  2. Verify 404 error
  3. Navigate to http://localhost:5173/admin
  4. Verify 404 error
  5. Verify control-panel routes work
- **Priority:** P2
- **Estimated Time:** 15 minutes
- **Status:** ❌ Not Started

#### 5.15 Test Audit Logs Capture Actions

- [ ] **Task:** Verify all admin actions are logged
- **Steps:**
  1. Perform various admin actions
  2. Check audit log page
  3. Verify actions appear with correct details
  4. Verify IP address is captured
  5. Verify staff can only see own actions
  6. Verify admin can see all actions
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

---

## 📚 DOCUMENTATION TASKS

#### 5.16 Create Admin User Guide

- [ ] **Task:** Document admin panel features and usage
- **File:** `ADMIN_USER_GUIDE.md` (NEW)
- **Priority:** P2
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 5.17 Create Staff User Guide

- [ ] **Task:** Document staff panel features and limitations
- **File:** `STAFF_USER_GUIDE.md` (NEW)
- **Priority:** P2
- **Estimated Time:** 1 hour
- **Status:** ❌ Not Started

#### 5.18 Update README with Security Notes

- [ ] **Task:** Document security improvements
- **File:** `README.md`
- **Priority:** P2
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

---

## 🚀 DEPLOYMENT CHECKLIST

#### 5.19 Update Production Environment Variables

- [ ] **Task:** Set ADMIN_URL_HASH in production .env
- **Priority:** P0
- **Estimated Time:** 10 minutes
- **Status:** ❌ Not Started

#### 5.20 Test Production Build

- [ ] **Task:** Verify admin panel works in production build
- **Priority:** P0
- **Estimated Time:** 30 minutes
- **Status:** ❌ Not Started

#### 5.21 Database Migration

- [ ] **Task:** Run migrations for AdminAction model updates
- **Command:** `python manage.py makemigrations && python manage.py migrate`
- **Priority:** P0
- **Estimated Time:** 5 minutes
- **Status:** ❌ Not Started

---

## 📊 PROGRESS TRACKING

### Week 1 Goals (Oct 4-11, 2025)

- [ ] Complete Phase 1 (Security Hardening)
- [ ] Begin Phase 2 (Permission System)

### Week 2 Goals (Oct 11-18, 2025)

- [ ] Complete Phase 2 (Permission System)
- [ ] Begin Phase 3 (Feature Parity)

### Week 3 Goals (Oct 18-25, 2025)

- [ ] Complete Phase 3 (Feature Parity)
- [ ] Begin Phase 4 (Audit Logging)

### Week 4 Goals (Oct 25-Nov 1, 2025)

- [ ] Complete Phase 4 (Audit Logging)
- [ ] Complete Phase 5 (Testing)
- [ ] Deploy to production

---

## 🎯 PRIORITY LEGEND

- **P0 (Critical):** Must complete before deployment
- **P1 (High):** Core functionality, complete in first iteration
- **P2 (Medium):** Nice-to-have features, can defer if needed
- **P3 (Low):** Future enhancements

---

## 📝 NOTES

### Staff Permissions Summary

- ✅ Can view dashboard (read-only stats, no financial data)
- ✅ Can view users (no edit/delete)
- ✅ Can approve/reject songs
- ✅ Can respond to support tickets
- ✅ Can view analytics (no export)
- ❌ Cannot edit users
- ❌ Cannot delete anything
- ❌ Cannot access settings
- ❌ Cannot send bulk notifications
- ❌ Cannot view financial data

### Admin Permissions Summary

- ✅ Full CRUD on all models
- ✅ Can change system settings
- ✅ Can send bulk notifications
- ✅ Can view and export all data
- ✅ Can assign tickets to staff
- ✅ Can verify artists

### Security Notes

- Old `/admin/` route must return 404
- Control panel URL should not be published publicly
- Consider IP whitelisting for control panel in production
- Enable 2FA for all admin accounts (future enhancement)
- Regular security audits of audit logs

---

**Last Updated:** October 4, 2025  
**Next Review:** October 11, 2025
