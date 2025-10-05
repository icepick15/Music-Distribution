/**
 * Permission utility functions for role-based access control
 * Centralized logic for checking user permissions across the admin panel
 */

/**
 * Check if user can perform a specific action
 * @param {Object} user - User object with role and permissions
 * @param {string} action - Action name to check
 * @returns {boolean} - True if user has permission
 */
export const canPerformAction = (user, action) => {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const permissions = {
    // Dashboard
    'view_dashboard': ['admin', 'staff'],
    
    // Users
    'view_users': ['admin', 'staff'],
    'edit_users': ['admin'],
    'delete_users': ['admin'],
    'verify_artists': ['admin'],
    'upgrade_subscriptions': ['admin'],
    
    // Songs
    'view_songs': ['admin', 'staff'],
    'approve_songs': ['admin', 'staff'],
    'reject_songs': ['admin', 'staff'],
    'delete_songs': ['admin'],
    'edit_songs': ['admin'],
    
    // Analytics
    'view_analytics': ['admin', 'staff'],
    'export_analytics': ['admin'],
    'view_financial_data': ['admin'],
    'view_revenue': ['admin'],
    
    // Support
    'view_tickets': ['admin', 'staff'],
    'respond_to_tickets': ['admin', 'staff'],
    'assign_tickets': ['admin'],
    'close_tickets': ['admin'],
    'delete_tickets': ['admin'],
    
    // Settings
    'manage_settings': ['admin'],
    'send_bulk_notifications': ['admin'],
    'edit_email_templates': ['admin'],
    'maintenance_mode': ['admin'],
    
    // Audit
    'view_audit_logs': ['admin', 'staff'],
    'view_all_audit_logs': ['admin'],
    'export_audit_logs': ['admin'],
  };
  
  const allowedRoles = permissions[action] || [];
  return allowedRoles.includes(user.role);
};

/**
 * Check if user has specific role
 * @param {Object} user - User object
 * @param {string} role - Role to check ('admin', 'staff', etc.)
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user) return false;
  if (user.is_superuser) return true;
  return user.role === role;
};

/**
 * Check if user is admin
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return user && (user.role === 'admin' || user.is_superuser);
};

/**
 * Check if user is staff
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isStaff = (user) => {
  return user && user.role === 'staff';
};

/**
 * Check if user is admin or staff
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const isAdminOrStaff = (user) => {
  return user && (user.role === 'admin' || user.role === 'staff' || user.is_staff || user.is_superuser);
};

/**
 * Get user's role display name
 * @param {Object} user - User object
 * @returns {string}
 */
export const getRoleDisplayName = (user) => {
  if (!user) return 'Guest';
  if (user.is_superuser) return 'Superuser';
  
  const roleNames = {
    'admin': 'Administrator',
    'staff': 'Staff Member',
    'artist': 'Artist',
    'user': 'User',
  };
  
  return roleNames[user.role] || 'User';
};

/**
 * Filter navigation items based on user permissions
 * @param {Array} navItems - Array of nav items with permission property
 * @param {Object} user - User object
 * @returns {Array} - Filtered nav items
 */
export const filterNavByPermissions = (navItems, user) => {
  if (!user) return [];
  
  return navItems.filter(item => {
    if (!item.permission) return true;
    return canPerformAction(user, item.permission);
  });
};

/**
 * Check if user can access a specific route
 * @param {Object} user - User object
 * @param {string} routePath - Route path to check
 * @returns {boolean}
 */
export const canAccessRoute = (user, routePath) => {
  if (!user) return false;
  if (user.is_superuser) return true;
  
  const routePermissions = {
    '/control-panel': ['admin', 'staff'],
    '/control-panel/users': ['admin', 'staff'],
    '/control-panel/artists': ['admin'],
    '/control-panel/songs': ['admin', 'staff'],
    '/control-panel/analytics': ['admin', 'staff'],
    '/control-panel/revenue': ['admin', 'staff'],
    '/control-panel/financial': ['admin'],
    '/control-panel/settings': ['admin'],
    '/control-panel/audit': ['admin', 'staff'],
    '/control-panel/support': ['admin', 'staff'],
  };
  
  const allowedRoles = routePermissions[routePath] || ['admin'];
  return allowedRoles.includes(user.role);
};

/**
 * Get permission badge color based on role
 * @param {Object} user - User object
 * @returns {string} - Tailwind color class
 */
export const getRoleBadgeColor = (user) => {
  if (!user) return 'gray';
  if (user.is_superuser) return 'purple';
  
  const colors = {
    'admin': 'red',
    'staff': 'blue',
    'artist': 'green',
    'user': 'gray',
  };
  
  return colors[user.role] || 'gray';
};
