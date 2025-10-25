-- ABC Company Inventory Management System Database Design

-- Products table (raw materials, components, finished goods)
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category ENUM('raw_material', 'component', 'finished_good') NOT NULL,
    unit VARCHAR(20) NOT NULL,
    reorder_point INT DEFAULT 0,
    unit_cost DECIMAL(10,2),
    supplier_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations table (head office, plants, warehouses)
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('head_office', 'manufacturing_plant', 'warehouse') NOT NULL,
    city VARCHAR(50) NOT NULL,
    address TEXT,
    manager_id INT
);

-- Current inventory levels
CREATE TABLE inventory (
    product_id INT,
    location_id INT,
    quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, location_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- All inventory transactions
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('receipt', 'issue', 'transfer', 'adjustment') NOT NULL,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity INT NOT NULL,
    reference_number VARCHAR(50),
    notes TEXT,
    user_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Suppliers information
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    payment_terms VARCHAR(50),
    active BOOLEAN DEFAULT TRUE
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    status ENUM('pending', 'approved', 'sent', 'received', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(12,2),
    order_date DATE NOT NULL,
    expected_date DATE,
    created_by INT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Purchase order line items
CREATE TABLE po_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    po_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    received_quantity INT DEFAULT 0,
    FOREIGN KEY (po_id) REFERENCES purchase_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Users and authentication
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'manager', 'staff', 'viewer') NOT NULL,
    location_id INT,
    active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- System alerts and notifications
CREATE TABLE alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('low_stock', 'reorder_needed', 'overstock', 'system') NOT NULL,
    product_id INT,
    location_id INT,
    message TEXT NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- Indexes for performance
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_transactions_date ON transactions(timestamp);
CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_alerts_unack ON alerts(acknowledged, created_at);

-- Sample data insertion
INSERT INTO locations (name, type, city) VALUES 
('Head Office', 'head_office', 'City X'),
('Manufacturing Plant Y', 'manufacturing_plant', 'City Y'),
('Manufacturing Plant Z', 'manufacturing_plant', 'City Z');

INSERT INTO products (name, category, unit, reorder_point, unit_cost) VALUES 
('Steel Sheet A4', 'raw_material', 'sheets', 100, 25.50),
('Brake Component X1', 'component', 'pieces', 50, 45.00),
('Engine Mount Standard', 'finished_good', 'units', 25, 120.00);