import { t } from 'i18next';
import { AirplaneOutlined, Car, Messages, Reserve, Room, Routing, ShippingBagColored, Ticket, UserSquareOutlined, PeopleColored } from '@/assets/svg'; 
import { User } from '../utils/interfaces/auth.interface';
import { BookingResponse } from '../utils/interfaces/booking.interface';
import { formatCLP } from '@/src/utils/formatters/currency';


export const getShortcuts = (travel?: BookingResponse) => [
  {
    icon: Routing,
    name: `${travel?.from?.address ?? ''} - ${travel?.to?.address ?? ''}`,
  },
  {
    icon: UserSquareOutlined,
    name: travel?.passengerName ?? '',
  },
  {
    icon: Messages,
    name: `${travel?.passengerContactCountryCode ?? ''} ${travel?.passengerContact ?? ''}`,
  },
  {
    icon: Room,
    name: t('booking.card.room', { ns: 'booking', room: travel?.passengerRoom }),
  },
  {
    icon: AirplaneOutlined,
    name: travel?.passengerFligth ?? '',
  },
  {
    icon: Car,
    name: `${travel?.hopper?.userInfo?.firstName ?? ''} ${travel?.hopper?.userInfo?.lastName ?? ''}`,
  },
  {
    icon: Ticket,
    name: t('booking.modal_hopper.tripValue', { amount: formatCLP(travel?.price), ns: 'booking' }),
  },
];

export const getShortcutsHopper = (travel?: BookingResponse, userHoppy?: User) => [
  {
    icon: UserSquareOutlined,
    name: travel?.passengerName ?? '',
  },
  {
    icon: Messages,
    name: `${travel?.passengerContactCountryCode ?? ''} ${travel?.passengerContact ?? ''}`,
  },
  {
    icon: Room,
    name: t('booking.card.room', { ns: 'booking', room: travel?.passengerRoom }),
  },
  {
    icon: AirplaneOutlined,
    name: travel?.passengerFligth ?? '',
  },
  {
    icon: ShippingBagColored,
    name: `${travel?.totalSuitCases ?? 0} ${Number(travel?.totalSuitCases) > 1
        ? t('booking.card.luggages', { ns: 'booking' })
        : t('booking.card.luggage', { ns: 'booking' })
      }`,
  },
  {
    icon: PeopleColored,
    name: `${travel?.totalPassengers ?? 0} ${Number(travel?.totalPassengers) > 1
        ? t('booking.card.passengers', { ns: 'booking' })
        : t('booking.card.passenger', { ns: 'booking' })
      }`,
  },
  {
    icon: Reserve,
    name: `${userHoppy?.userInfo?.firstName ?? ''} ${userHoppy?.userInfo?.lastName ?? ''}`,
  },
  {
    icon: Ticket,
    name: t('booking.modal_hopper.tripValue', { amount: formatCLP(travel?.price), ns: 'booking' }),
  },
];
