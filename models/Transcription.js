import mongoose from 'mongoose';

const actionItemSchema = new mongoose.Schema({
  task: { type: String, required: true },
  assignedTo: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, default: 'Pending' },
});

const transcriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true }, 
  transcript: { type: String, required: true },
  notes: { type: String, required: true },
  actionItems: [actionItemSchema], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` field before saving
transcriptionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the model already exists before defining it
const Transcription = mongoose.models.Transcription || mongoose.model('Transcription', transcriptionSchema);

module.exports = Transcription;