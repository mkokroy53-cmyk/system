// ABC Company Inventory Management System - JavaScript Application

class InventoryManagementSystem {
    constructor() {
        this.currentUser = null;
        this.currentLocation = null;
        this.products = [];
        this.transactions = [];
        this.users = [];
        this.alerts = [];
        
        this.initializeSystem();
        this.setupEventListeners();
        this.loadSampleData();
    }

    initializeSystem() {
        // Initialize default users
        this.users = [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator' },
            { id: 2, username: 'manager_y', password: 'manager123', role: 'manager', name: 'Plant Y Manager' },
            { id: 3, username: 'manager_z', password: 'manager123', role: 'manager', name: 'Plant Z Manager' },
            { id: 4, username: 'staff_y', password: 'staff123', role: 'staff', name: 'Plant Y Staff' },
            { id: 5, username: 'staff_z', password: 'staff123', role: 'staff', name: 'Plant Z Staff' }
        ];

        // Load data from localStorage if available
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Product management
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductModal();
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });

        // Transaction management
        document.getElementById('addTransactionBtn').addEventListener('click', () => {
            this.showTransactionForm();
        });

        document.getElementById('newTransactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        document.getElementById('cancelTransaction').addEventListener('click', () => {
            this.hideTransactionForm();
        });

        // Search and filters
        document.getElementById('searchProduct').addEventListener('input', () => {
            this.filterInventory();
        });

        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterInventory();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.cancel').addEventListener('click', () => {
            this.closeModal();
        });
    }

    loadSampleData() {
        // Sample products
        this.products = [
            {
                id: 1,
                name: 'Steel Sheet A4',
                category: 'raw_material',
                unit: 'sheets',
                reorderPoint: 100,
                unitCost: 25.50,
                stock: {
                    head_office: 150,
                    plant_y: 80,
                    plant_z: 120
                }
            },
            {
                id: 2,
                name: 'Brake Component X1',
                category: 'component',
                unit: 'pieces',
                reorderPoint: 50,
                unitCost: 45.00,
                stock: {
                    head_office: 200,
                    plant_y: 30,
                    plant_z: 45
                }
            },
            {
                id: 3,
                name: 'Engine Mount Standard',
                category: 'finished_good',
                unit: 'units',
                reorderPoint: 25,
                unitCost: 120.00,
                stock: {
                    head_office: 50,
                    plant_y: 15,
                    plant_z: 20
                }
            },
            {
                id: 4,
                name: 'Aluminum Rod 10mm',
                category: 'raw_material',
                unit: 'meters',
                reorderPoint: 200,
                unitCost: 8.75,
                stock: {
                    head_office: 300,
                    plant_y: 150,
                    plant_z: 180
                }
            }
        ];

        // Sample transactions
        this.transactions = [
            {
                id: 1,
                type: 'receipt',
                productId: 1,
                location: 'plant_y',
                quantity: 50,
                reference: 'PO-2024-001',
                notes: 'Monthly steel delivery',
                user: 'staff_y',
                timestamp: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: 2,
                type: 'issue',
                productId: 2,
                location: 'plant_y',
                quantity: -20,
                reference: 'PROD-001',
                notes: 'Production line usage',
                user: 'staff_y',
                timestamp: new Date(Date.now() - 43200000).toISOString()
            }
        ];

        this.generateAlerts();
        this.saveToStorage();
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const location = document.getElementById('location').value;

        const user = this.users.find(u => u.username === username && u.password === password);

        if (user && location) {
            this.currentUser = user;
            this.currentLocation = location;
            
            document.getElementById('currentUser').textContent = user.name;
            document.getElementById('currentLocation').textContent = this.getLocationName(location);
            
            this.showDashboard();
            this.updateDashboard();
        } else {
            alert('Invalid credentials or location not selected');
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.currentLocation = null;
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('dashboardScreen').classList.remove('active');
        document.getElementById('loginForm').reset();
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('dashboardScreen').classList.add('active');
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Load section-specific data
        switch(section) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'inventory':
                this.updateInventoryTable();
                break;
            case 'transactions':
                this.updateTransactionsTable();
                break;
        }
    }

    updateDashboard() {
        const locationStock = this.getLocationStock();
        
        document.getElementById('totalProducts').textContent = this.products.length;
        document.getElementById('lowStockItems').textContent = this.getLowStockCount();
        document.getElementById('recentTransactions').textContent = this.getRecentTransactionsCount();
        document.getElementById('pendingOrders').textContent = this.getPendingOrdersCount();
        
        this.updateAlertsList();
    }

    getLocationStock() {
        return this.products.reduce((total, product) => {
            return total + (product.stock[this.currentLocation] || 0);
        }, 0);
    }

    getLowStockCount() {
        return this.products.filter(product => {
            const currentStock = product.stock[this.currentLocation] || 0;
            return currentStock <= product.reorderPoint;
        }).length;
    }

    getRecentTransactionsCount() {
        const oneDayAgo = new Date(Date.now() - 86400000);
        return this.transactions.filter(t => 
            new Date(t.timestamp) > oneDayAgo && t.location === this.currentLocation
        ).length;
    }

    getPendingOrdersCount() {
        // Simulate pending orders based on low stock items
        return this.getLowStockCount();
    }

    generateAlerts() {
        this.alerts = [];
        
        this.products.forEach(product => {
            Object.keys(product.stock).forEach(location => {
                const stock = product.stock[location];
                if (stock <= product.reorderPoint * 0.5) {
                    this.alerts.push({
                        type: 'critical',
                        message: `Critical: ${product.name} at ${this.getLocationName(location)} is critically low (${stock} ${product.unit})`,
                        location: location,
                        productId: product.id
                    });
                } else if (stock <= product.reorderPoint) {
                    this.alerts.push({
                        type: 'warning',
                        message: `Warning: ${product.name} at ${this.getLocationName(location)} needs reordering (${stock} ${product.unit})`,
                        location: location,
                        productId: product.id
                    });
                }
            });
        });
    }

    updateAlertsList() {
        const alertsList = document.getElementById('alertsList');
        const locationAlerts = this.alerts.filter(alert => alert.location === this.currentLocation);
        
        if (locationAlerts.length === 0) {
            alertsList.innerHTML = '<div class="alert alert-info">No alerts for this location</div>';
            return;
        }

        alertsList.innerHTML = locationAlerts.map(alert => 
            `<div class="alert alert-${alert.type}">${alert.message}</div>`
        ).join('');
    }

    updateInventoryTable() {
        const tbody = document.getElementById('inventoryTableBody');
        const searchTerm = document.getElementById('searchProduct').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        let filteredProducts = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        tbody.innerHTML = filteredProducts.map(product => {
            const currentStock = product.stock[this.currentLocation] || 0;
            const status = this.getStockStatus(currentStock, product.reorderPoint);
            
            return `
                <tr>
                    <td>${product.name}</td>
                    <td>${this.formatCategory(product.category)}</td>
                    <td>${currentStock} ${product.unit}</td>
                    <td>${product.reorderPoint}</td>
                    <td>$${product.unitCost.toFixed(2)}</td>
                    <td class="status-${status.class}">${status.text}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="inventorySystem.editProduct(${product.id})">Edit</button>
                        <button class="action-btn delete-btn" onclick="inventorySystem.deleteProduct(${product.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getStockStatus(currentStock, reorderPoint) {
        if (currentStock <= reorderPoint * 0.5) {
            return { class: 'critical', text: 'Critical' };
        } else if (currentStock <= reorderPoint) {
            return { class: 'low', text: 'Low Stock' };
        } else {
            return { class: 'ok', text: 'OK' };
        }
    }

    formatCategory(category) {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    filterInventory() {
        this.updateInventoryTable();
    }

    showProductModal(productId = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        
        if (productId) {
            const product = this.products.find(p => p.id === productId);
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productUnit').value = product.unit;
            document.getElementById('productReorderPoint').value = product.reorderPoint;
            document.getElementById('productUnitCost').value = product.unitCost;
            document.getElementById('initialStock').value = product.stock[this.currentLocation] || 0;
        } else {
            document.getElementById('modalTitle').textContent = 'Add Product';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('productModal').style.display = 'none';
    }

    saveProduct() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);
        
        const productData = {
            name: formData.get('productName') || document.getElementById('productName').value,
            category: formData.get('productCategory') || document.getElementById('productCategory').value,
            unit: formData.get('productUnit') || document.getElementById('productUnit').value,
            reorderPoint: parseInt(document.getElementById('productReorderPoint').value),
            unitCost: parseFloat(document.getElementById('productUnitCost').value),
            initialStock: parseInt(document.getElementById('initialStock').value) || 0
        };

        const productId = document.getElementById('productId').value;

        if (productId) {
            // Edit existing product
            const product = this.products.find(p => p.id === parseInt(productId));
            Object.assign(product, productData);
            product.stock[this.currentLocation] = productData.initialStock;
        } else {
            // Add new product
            const newProduct = {
                id: Date.now(),
                ...productData,
                stock: {
                    head_office: 0,
                    plant_y: 0,
                    plant_z: 0
                }
            };
            newProduct.stock[this.currentLocation] = productData.initialStock;
            this.products.push(newProduct);
        }

        this.generateAlerts();
        this.saveToStorage();
        this.updateInventoryTable();
        this.closeModal();
        
        alert('Product saved successfully!');
    }

    editProduct(productId) {
        this.showProductModal(productId);
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveToStorage();
            this.updateInventoryTable();
            alert('Product deleted successfully!');
        }
    }

    showTransactionForm() {
        document.getElementById('transactionForm').style.display = 'block';
        this.populateProductDropdown();
    }

    hideTransactionForm() {
        document.getElementById('transactionForm').style.display = 'none';
        document.getElementById('newTransactionForm').reset();
    }

    populateProductDropdown() {
        const select = document.getElementById('transactionProduct');
        select.innerHTML = '<option value="">Select Product</option>';
        
        this.products.forEach(product => {
            select.innerHTML += `<option value="${product.id}">${product.name}</option>`;
        });
    }

    addTransaction() {
        const type = document.getElementById('transactionType').value;
        const productId = parseInt(document.getElementById('transactionProduct').value);
        const quantity = parseInt(document.getElementById('transactionQuantity').value);
        const reference = document.getElementById('transactionReference').value;
        const notes = document.getElementById('transactionNotes').value;

        if (!type || !productId || !quantity) {
            alert('Please fill in all required fields');
            return;
        }

        const product = this.products.find(p => p.id === productId);
        if (!product) {
            alert('Product not found');
            return;
        }

        // Adjust quantity based on transaction type
        let adjustedQuantity = quantity;
        if (type === 'issue' || type === 'transfer') {
            adjustedQuantity = -Math.abs(quantity);
        }

        // Check if there's enough stock for issues/transfers
        if (adjustedQuantity < 0) {
            const currentStock = product.stock[this.currentLocation] || 0;
            if (currentStock + adjustedQuantity < 0) {
                alert('Insufficient stock for this transaction');
                return;
            }
        }

        // Create transaction record
        const transaction = {
            id: Date.now(),
            type: type,
            productId: productId,
            location: this.currentLocation,
            quantity: adjustedQuantity,
            reference: reference,
            notes: notes,
            user: this.currentUser.username,
            timestamp: new Date().toISOString()
        };

        this.transactions.push(transaction);

        // Update stock
        product.stock[this.currentLocation] = (product.stock[this.currentLocation] || 0) + adjustedQuantity;

        this.generateAlerts();
        this.saveToStorage();
        this.updateTransactionsTable();
        this.hideTransactionForm();
        
        alert('Transaction added successfully!');
    }

    updateTransactionsTable() {
        const tbody = document.getElementById('transactionsTableBody');
        const locationTransactions = this.transactions
            .filter(t => t.location === this.currentLocation)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50); // Show last 50 transactions

        tbody.innerHTML = locationTransactions.map(transaction => {
            const product = this.products.find(p => p.id === transaction.productId);
            const productName = product ? product.name : 'Unknown Product';
            
            return `
                <tr>
                    <td>${new Date(transaction.timestamp).toLocaleDateString()}</td>
                    <td>${this.formatCategory(transaction.type)}</td>
                    <td>${productName}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.reference || '-'}</td>
                    <td>${transaction.user}</td>
                </tr>
            `;
        }).join('');
    }

    getLocationName(locationCode) {
        const locations = {
            'head_office': 'Head Office - City X',
            'plant_y': 'Manufacturing Plant Y',
            'plant_z': 'Manufacturing Plant Z'
        };
        return locations[locationCode] || locationCode;
    }

    saveToStorage() {
        localStorage.setItem('abc_inventory_products', JSON.stringify(this.products));
        localStorage.setItem('abc_inventory_transactions', JSON.stringify(this.transactions));
        localStorage.setItem('abc_inventory_alerts', JSON.stringify(this.alerts));
    }

    loadFromStorage() {
        const products = localStorage.getItem('abc_inventory_products');
        const transactions = localStorage.getItem('abc_inventory_transactions');
        const alerts = localStorage.getItem('abc_inventory_alerts');

        if (products) this.products = JSON.parse(products);
        if (transactions) this.transactions = JSON.parse(transactions);
        if (alerts) this.alerts = JSON.parse(alerts);
    }
}

// Report Generation Functions
function generateInventoryReport() {
    const output = document.getElementById('reportOutput');
    const system = window.inventorySystem;
    
    let html = '<h3>Inventory Summary Report</h3>';
    html += `<p>Generated on: ${new Date().toLocaleDateString()}</p>`;
    html += `<p>Location: ${system.getLocationName(system.currentLocation)}</p>`;
    html += '<table><thead><tr><th>Product</th><th>Category</th><th>Current Stock</th><th>Reorder Point</th><th>Status</th></tr></thead><tbody>';
    
    system.products.forEach(product => {
        const stock = product.stock[system.currentLocation] || 0;
        const status = system.getStockStatus(stock, product.reorderPoint);
        html += `<tr>
            <td>${product.name}</td>
            <td>${system.formatCategory(product.category)}</td>
            <td>${stock} ${product.unit}</td>
            <td>${product.reorderPoint}</td>
            <td class="status-${status.class}">${status.text}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    output.innerHTML = html;
}

function generateLowStockReport() {
    const output = document.getElementById('reportOutput');
    const system = window.inventorySystem;
    
    const lowStockItems = system.products.filter(product => {
        const stock = product.stock[system.currentLocation] || 0;
        return stock <= product.reorderPoint;
    });
    
    let html = '<h3>Low Stock Report</h3>';
    html += `<p>Generated on: ${new Date().toLocaleDateString()}</p>`;
    html += `<p>Location: ${system.getLocationName(system.currentLocation)}</p>`;
    html += `<p>Items requiring attention: ${lowStockItems.length}</p>`;
    
    if (lowStockItems.length > 0) {
        html += '<table><thead><tr><th>Product</th><th>Current Stock</th><th>Reorder Point</th><th>Suggested Order Qty</th></tr></thead><tbody>';
        
        lowStockItems.forEach(product => {
            const stock = product.stock[system.currentLocation] || 0;
            const suggestedOrder = Math.max(product.reorderPoint * 2 - stock, product.reorderPoint);
            html += `<tr>
                <td>${product.name}</td>
                <td>${stock} ${product.unit}</td>
                <td>${product.reorderPoint}</td>
                <td>${suggestedOrder} ${product.unit}</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
    } else {
        html += '<p>No items currently below reorder point.</p>';
    }
    
    output.innerHTML = html;
}

function generateTransactionReport() {
    const output = document.getElementById('reportOutput');
    const system = window.inventorySystem;
    
    const recentTransactions = system.transactions
        .filter(t => t.location === system.currentLocation)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
    
    let html = '<h3>Recent Transactions Report</h3>';
    html += `<p>Generated on: ${new Date().toLocaleDateString()}</p>`;
    html += `<p>Location: ${system.getLocationName(system.currentLocation)}</p>`;
    html += '<table><thead><tr><th>Date</th><th>Type</th><th>Product</th><th>Quantity</th><th>Reference</th></tr></thead><tbody>';
    
    recentTransactions.forEach(transaction => {
        const product = system.products.find(p => p.id === transaction.productId);
        const productName = product ? product.name : 'Unknown Product';
        html += `<tr>
            <td>${new Date(transaction.timestamp).toLocaleDateString()}</td>
            <td>${system.formatCategory(transaction.type)}</td>
            <td>${productName}</td>
            <td>${transaction.quantity}</td>
            <td>${transaction.reference || '-'}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    output.innerHTML = html;
}

function showUserManagement() {
    alert('User Management: This feature allows administrators to add, edit, and manage user accounts across all locations.');
}

function backupData() {
    const system = window.inventorySystem;
    const backupData = {
        products: system.products,
        transactions: system.transactions,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `abc_inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Data backup downloaded successfully!');
}

// Initialize the system when the page loads
window.addEventListener('DOMContentLoaded', () => {
    window.inventorySystem = new InventoryManagementSystem();
});