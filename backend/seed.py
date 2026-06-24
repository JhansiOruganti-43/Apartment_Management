from app import app, db
from database import Resident, Flat, MaintenanceBill, Payment, Expense, User, Document, Setting

def seed_data():
    with app.app_context():
        # Clear existing data to avoid duplicates if run multiple times
        db.session.query(Resident).delete()
        db.session.query(Flat).delete()
        db.session.query(User).delete()

        # Add Admin User
        from werkzeug.security import generate_password_hash
        admin_user = User(
            username="admin",
            password_hash=generate_password_hash("admin123"),
            role="admin"
        )
        db.session.add(admin_user)
        db.session.commit()

        # Add sample flats
        flats_data = [
            Flat(flat_id="A101", block="A", floor=1, type="2BHK"),
            Flat(flat_id="A102", block="A", floor=1, type="3BHK"),
            Flat(flat_id="B201", block="B", floor=2, type="1BHK"),
            Flat(flat_id="C501", block="C", floor=5, type="Penthouse"),
            Flat(flat_id="B202", block="B", floor=2, type="2BHK")
        ]
        db.session.add_all(flats_data)
        db.session.commit()

        # Add sample residents
        residents_data = [
            Resident(name="John Doe", flat_id="A101", phone="555-0101", email="john.d@example.com", members=3),
            Resident(name="Jane Smith", flat_id="A102", phone="555-0102", email="jane.smith@example.com", members=4),
            Resident(name="Mike Johnson", flat_id="B201", phone="555-0201", email="mike.j@example.com", members=1),
            Resident(name="Sarah Williams", flat_id="C501", phone="555-0501", email="sarah.w@example.com", members=5)
        ]
        db.session.add_all(residents_data)
        db.session.commit()

        # Add User accounts for residents
        users_data = []
        for resident in residents_data:
            users_data.append(User(
                username=resident.email.split('@')[0],
                password_hash=generate_password_hash("resident123"),
                role="resident",
                resident_id=resident.id
            ))
        db.session.add_all(users_data)
        db.session.commit()

        # Add sample bills
        bills_data = [
            MaintenanceBill(flat_id="A101", month="January", year=2026, maintenance_amount=100.0, water_charge=20.0, electricity_charge=50.0, total_amount=170.0, status="Pending"),
            MaintenanceBill(flat_id="A102", month="January", year=2026, maintenance_amount=150.0, water_charge=30.0, electricity_charge=80.0, total_amount=260.0, status="Paid")
        ]
        db.session.add_all(bills_data)
        db.session.commit()

        # Add sample payments
        payments_data = [
            Payment(bill_id=2, amount=260.0, payment_mode="Bank Transfer", transaction_id="TXN123456")
        ]
        db.session.add_all(payments_data)
        db.session.commit()

        # Add sample expenses
        expenses_data = [
            Expense(category="Security", amount=1200.0, description="Monthly security guard agency fee"),
            Expense(category="Repairs", amount=350.0, description="Elevator maintenance")
        ]
        db.session.add_all(expenses_data)
        db.session.commit()

        print("Database successfully seeded with mock data for all Phase 1 modules!")

if __name__ == "__main__":
    seed_data()
