from flask import Flask, request, jsonify
from flask_cors import CORS
from database import db, Resident, Flat, MaintenanceBill, Payment, Expense, Complaint, User, generate_payment_id
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    # Seed default admin user
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', password='admin123', role='admin')
        db.session.add(admin)
        db.session.commit()

# ==== AUTH ====

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.password == data.get('password'):
        return jsonify({
            "success": True,
            "role": user.role,
            "username": user.username,
            "resident_id": user.resident_id
        }), 200
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# ==== STATS ====

@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_flats = Flat.query.count()
    occupied_flats = Flat.query.filter_by(status='Occupied').count()
    vacant_flats = Flat.query.filter_by(status='Vacant').count()
    total_residents = Resident.query.count()
    pending_bills = MaintenanceBill.query.filter_by(status='Pending').count()
    total_expenses = db.session.query(db.func.sum(Expense.amount)).scalar() or 0
    total_revenue = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
    total_complaints = Complaint.query.count()
    pending_complaints = Complaint.query.filter_by(status='Pending').count()
    resolved_complaints = Complaint.query.filter_by(status='Resolved').count()

    return jsonify({
        "total_flats": total_flats,
        "occupied_flats": occupied_flats,
        "vacant_flats": vacant_flats,
        "total_residents": total_residents,
        "pending_bills": pending_bills,
        "total_expenses": round(total_expenses, 2),
        "total_revenue": round(total_revenue, 2),
        "total_complaints": total_complaints,
        "pending_complaints": pending_complaints,
        "resolved_complaints": resolved_complaints,
    }), 200

# ==== RESIDENTS ====

@app.route('/api/residents', methods=['GET', 'POST'])
def handle_residents():
    if request.method == 'GET':
        residents = Resident.query.all()
        return jsonify([r.to_dict() for r in residents]), 200

    if request.method == 'POST':
        data = request.json
        new_resident = Resident(
            name=data.get("name"),
            flat_id=data.get("flat_id"),
            phone=data.get("phone"),
            email=data.get("email"),
            members=data.get("members", 1)
        )
        db.session.add(new_resident)

        # Mark flat as Occupied
        flat = Flat.query.filter_by(flat_id=data.get("flat_id")).first()
        if flat:
            flat.status = 'Occupied'

        db.session.commit()
        return jsonify({"message": "Resident added successfully", "id": new_resident.id}), 201

@app.route('/api/residents/<int:resident_id>', methods=['DELETE'])
def delete_resident(resident_id):
    try:
        resident = Resident.query.get(resident_id)
        if resident:
            flat_id = resident.flat_id
            db.session.delete(resident)

            # Check if any other resident is in the same flat
            remaining = Resident.query.filter_by(flat_id=flat_id).count()
            if remaining == 0:
                flat = Flat.query.filter_by(flat_id=flat_id).first()
                if flat:
                    flat.status = 'Vacant'

            db.session.commit()
            return jsonify({"message": "Resident deleted"}), 200
        return jsonify({"error": "Resident not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ==== FLATS ====

@app.route('/api/flats', methods=['GET', 'POST'])
def handle_flats():
    if request.method == 'GET':
        flats = Flat.query.all()
        return jsonify([f.to_dict() for f in flats]), 200

    if request.method == 'POST':
        data = request.json
        new_flat = Flat(
            flat_id=data.get("flat_id"),
            block=data.get("block"),
            floor=data.get("floor"),
            type=data.get("type"),
            status='Vacant'
        )
        try:
            db.session.add(new_flat)
            db.session.commit()
            return jsonify({"message": "Flat added successfully", "id": new_flat.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Flat ID must be unique"}), 400

@app.route('/api/flats/<int:flat_id>', methods=['DELETE'])
def delete_flat(flat_id):
    try:
        flat = Flat.query.get(flat_id)
        if flat:
            db.session.delete(flat)
            db.session.commit()
            return jsonify({"message": "Flat deleted"}), 200
        return jsonify({"error": "Flat not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ==== BILLING ====

@app.route('/api/bills', methods=['GET', 'POST'])
def handle_bills():
    if request.method == 'GET':
        bills = MaintenanceBill.query.order_by(MaintenanceBill.id.desc()).all()
        return jsonify([b.to_dict() for b in bills]), 200

    if request.method == 'POST':
        data = request.json
        total = (float(data.get('maintenance_amount', 0)) +
                 float(data.get('water_charge', 0)) +
                 float(data.get('electricity_charge', 0)) +
                 float(data.get('other_charges', 0)))
        new_bill = MaintenanceBill(
            flat_id=data.get('flat_id'),
            month=data.get('month'),
            year=data.get('year'),
            maintenance_amount=data.get('maintenance_amount', 0),
            water_charge=data.get('water_charge', 0),
            electricity_charge=data.get('electricity_charge', 0),
            other_charges=data.get('other_charges', 0),
            total_amount=total,
            status='Pending'
        )
        db.session.add(new_bill)
        db.session.commit()
        return jsonify({"message": "Bill generated", "id": new_bill.id}), 201

@app.route('/api/bills/<int:bill_id>', methods=['PUT', 'DELETE'])
def handle_bill(bill_id):
    bill = MaintenanceBill.query.get(bill_id)
    if not bill:
        return jsonify({"error": "Bill not found"}), 404

    if request.method == 'PUT':
        data = request.json
        bill.flat_id = data.get('flat_id', bill.flat_id)
        bill.month = data.get('month', bill.month)
        bill.year = data.get('year', bill.year)
        bill.maintenance_amount = float(data.get('maintenance_amount', bill.maintenance_amount))
        bill.water_charge = float(data.get('water_charge', bill.water_charge))
        bill.electricity_charge = float(data.get('electricity_charge', bill.electricity_charge))
        bill.other_charges = float(data.get('other_charges', bill.other_charges))
        bill.total_amount = bill.maintenance_amount + bill.water_charge + bill.electricity_charge + bill.other_charges
        db.session.commit()
        return jsonify({"message": "Bill updated"}), 200

    if request.method == 'DELETE':
        db.session.delete(bill)
        db.session.commit()
        return jsonify({"message": "Bill deleted"}), 200

# ==== PAYMENTS ====

@app.route('/api/payments', methods=['GET', 'POST'])
def handle_payments():
    if request.method == 'GET':
        payments = Payment.query.order_by(Payment.id.desc()).all()
        return jsonify([p.to_dict() for p in payments]), 200

    if request.method == 'POST':
        data = request.json
        new_payment = Payment(
            payment_ref=generate_payment_id(),
            bill_id=data.get('bill_id'),
            amount=data.get('amount'),
            payment_mode=data.get('payment_mode'),
            transaction_id=data.get('transaction_id')
        )
        db.session.add(new_payment)

        # Mark bill as paid
        bill = MaintenanceBill.query.get(data.get('bill_id'))
        if bill:
            bill.status = 'Paid'

        db.session.commit()
        return jsonify({"message": "Payment recorded", "id": new_payment.id, "payment_ref": new_payment.payment_ref}), 201

# ==== EXPENSES ====

@app.route('/api/expenses', methods=['GET', 'POST'])
def handle_expenses():
    if request.method == 'GET':
        expenses = Expense.query.order_by(Expense.id.desc()).all()
        return jsonify([e.to_dict() for e in expenses]), 200

    if request.method == 'POST':
        data = request.json
        new_expense = Expense(
            category=data.get('category'),
            amount=data.get('amount'),
            description=data.get('description')
        )
        db.session.add(new_expense)
        db.session.commit()
        return jsonify({"message": "Expense recorded", "id": new_expense.id}), 201

@app.route('/api/expenses/<int:expense_id>', methods=['PUT', 'DELETE'])
def handle_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if not expense:
        return jsonify({"error": "Expense not found"}), 404

    if request.method == 'PUT':
        data = request.json
        expense.category = data.get('category', expense.category)
        expense.amount = float(data.get('amount', expense.amount))
        expense.description = data.get('description', expense.description)
        db.session.commit()
        return jsonify({"message": "Expense updated"}), 200

    if request.method == 'DELETE':
        db.session.delete(expense)
        db.session.commit()
        return jsonify({"message": "Expense deleted"}), 200

# ==== COMPLAINTS ====

@app.route('/api/complaints', methods=['GET', 'POST'])
def handle_complaints():
    if request.method == 'GET':
        complaints = Complaint.query.order_by(Complaint.id.desc()).all()
        return jsonify([c.to_dict() for c in complaints]), 200

    if request.method == 'POST':
        data = request.json
        new_complaint = Complaint(
            resident_name=data.get('resident_name'),
            flat_id=data.get('flat_id'),
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            priority=data.get('priority', 'Medium'),
            status='Pending'
        )
        db.session.add(new_complaint)
        db.session.commit()
        return jsonify({"message": "Complaint raised", "id": new_complaint.id}), 201

@app.route('/api/complaints/<int:complaint_id>', methods=['PUT', 'DELETE'])
def handle_complaint(complaint_id):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "Complaint not found"}), 404

    if request.method == 'PUT':
        data = request.json
        complaint.status = data.get('status', complaint.status)
        complaint.remarks = data.get('remarks', complaint.remarks)
        db.session.commit()
        return jsonify({"message": "Complaint updated"}), 200

    if request.method == 'DELETE':
        db.session.delete(complaint)
        db.session.commit()
        return jsonify({"message": "Complaint deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
