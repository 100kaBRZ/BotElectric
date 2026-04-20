const mongoose = require('mongoose');

const serviceOrderSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  car: {
    make: String,
    model: String,
    year: Number,
    vin: String,
    licensePlate: String
  },
  services: [{
    name: String,
    description: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true
  },
  diagnosis: String,
  totalAmount: Number,
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid'],
    default: 'unpaid'
  },
  startDate: Date,
  endDate: Date,
  photos: [String],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

serviceOrderSchema.pre('save', function(next) {
  if (this.services && this.services.length > 0) {
    this.totalAmount = this.services.reduce((sum, service) => {
      return sum + (service.price * service.quantity);
    }, 0);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ServiceOrder', serviceOrderSchema);
