import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as resourceBookingController from '../controllers/resource-booking.controller';

const router = Router();

router.use(authenticate);

router.post('/bookings', resourceBookingController.createBooking);
router.get('/bookings', resourceBookingController.getBookings);
router.put('/bookings/:id', resourceBookingController.updateBooking);
router.delete('/bookings/:id', resourceBookingController.deleteBooking);

export default router;


