import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    posterUrl: { type: String, required: true, trim: true },
    description: { type: String, default: 'Description not available', trim: true },
    movieId: { type: String, required: true, trim: true, unique: true },
    releaseDate: { type: Date },
    trailerLink: { type: String, default: '' },
    genre: { type: String, default: '' },
    category: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
