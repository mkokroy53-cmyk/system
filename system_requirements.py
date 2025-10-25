# ABC Company Inventory Management System - Core Requirements

class InventorySystem:
    def __init__(self):
        self.locations = ['Head Office - City X', 'Plant Y', 'Plant Z']
        self.user_roles = ['Admin', 'Manager', 'Staff', 'Viewer']
        
    def functional_requirements(self):
        return {
            'inventory_tracking': {
                'real_time_updates': True,
                'multi_location': True,
                'barcode_support': True,
                'categories': ['raw_materials', 'wip', 'finished_goods']
            },
            'automated_reordering': {
                'reorder_points': True,
                'supplier_integration': True,
                'approval_workflow': True
            },
            'reporting': {
                'real_time_dashboard': True,
                'custom_reports': True,
                'automated_alerts': True,
                'export_formats': ['PDF', 'Excel', 'CSV']
            },
            'production_integration': {
                'schedule_sync': True,
                'material_allocation': True,
                'completion_tracking': True
            }
        }
    
    def non_functional_requirements(self):
        return {
            'performance': {
                'response_time': '<2 seconds',
                'concurrent_users': 50,
                'uptime': '99.5%'
            },
            'security': {
                'role_based_access': True,
                'data_encryption': True,
                'audit_trail': True,
                'backup_frequency': 'daily'
            },
            'scalability': {
                'additional_locations': True,
                'increased_transactions': True,
                'future_integrations': True
            }
        }

class DatabaseSchema:
    def __init__(self):
        self.tables = {
            'products': ['id', 'name', 'category', 'unit', 'reorder_point'],
            'locations': ['id', 'name', 'type', 'address'],
            'inventory': ['product_id', 'location_id', 'quantity', 'last_updated'],
            'transactions': ['id', 'type', 'product_id', 'location_id', 'quantity', 'timestamp'],
            'suppliers': ['id', 'name', 'contact_info', 'products_supplied'],
            'users': ['id', 'username', 'role', 'location_access', 'permissions']
        }

# Key Business Rules
BUSINESS_RULES = {
    'reorder_trigger': 'quantity <= reorder_point',
    'approval_required': 'purchase_amount > $5000',
    'stock_transfer': 'requires_manager_approval',
    'data_retention': '7_years_minimum'
}

# Implementation Phases
IMPLEMENTATION_PHASES = {
    'phase_1': {
        'duration': '3 months',
        'features': ['basic_inventory_tracking', 'user_management', 'reporting']
    },
    'phase_2': {
        'duration': '2 months', 
        'features': ['automated_reordering', 'supplier_integration']
    },
    'phase_3': {
        'duration': '2 months',
        'features': ['mobile_app', 'advanced_analytics', 'forecasting']
    }
}