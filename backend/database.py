from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import random
import string

db = SQLAlchemy()

class Resident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    flat_id = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    members = db.Column(db.Integer, default=1)

    def to_dict(self):
        return { "id": self.id, "name": self.name, "flat_id": self.flat_id, "phone": self.phone, "email": self.email, "members": self.members }

class Flat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    flat_id = db.Column(db.String(20), nullable=False, unique=True)
    block = db.Column(db.String(10), nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='Vacant')  # Occupied or Vacant

    def to_dict(self):
        return { "id": self.id, "flat_id": self.flat_id, "block": self.block, "floor": self.floor, "type": self.type, "status": self.status }

class MaintenanceBill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    flat_id = db.Column(db.String(20), nullable=False)
    month = db.Column(db.String(20), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    maintenance_amount = db.Column(db.Float, default=0.0)
    water_charge = db.Column(db.Float, default=0.0)
    electricity_charge = db.Column(db.Float, default=0.0)
    other_charges = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='Pending')  # Pending, Paid

    def to_dict(self):
        return { "id": self.id, "flat_id": self.flat_id, "month": self.month, "year": self.year, "maintenance_amount": self.maintenance_amount, "water_charge": self.water_charge, "electricity_charge": self.electricity_charge, "other_charges": self.other_charges, "total_amount": self.total_amount, "status": self.status }

def generate_payment_id():
    digits = ''.join(random.choices(string.digits, k=6))
    return f"PAY-{digits}"

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    payment_ref = db.Column(db.String(20), nullable=False, default=generate_payment_id)
    bill_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_mode = db.Column(db.String(50), nullable=False)
    transaction_id = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "payment_ref": self.payment_ref,
            "bill_id": self.bill_id,
            "amount": self.amount,
            "payment_date": self.payment_date.strftime('%Y-%m-%d %H:%M:%S'),
            "payment_mode": self.payment_mode,
            "transaction_id": self.transaction_id
        }

class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return { "id": self.id, "category": self.category, "amount": self.amount, "description": self.description, "date": self.date.strftime('%Y-%m-%d') }

class Complaint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resident_name = db.Column(db.String(100), nullable=False)
    flat_id = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    priority = db.Column(db.String(50), nullable=False, default='Medium')
    status = db.Column(db.String(50), default='Pending')  # Pending, In Progress, Resolved
    remarks = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "resident_name": self.resident_name,
            "flat_id": self.flat_id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "priority": self.priority,
            "status": self.status,
            "remarks": self.remarks,
            "created_at": self.created_at.strftime('%Y-%m-%d %H:%M')
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='resident')  # admin or resident
    resident_id = db.Column(db.Integer, nullable=True)

class Notice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False)

class Setting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.String(255), nullable=False)
