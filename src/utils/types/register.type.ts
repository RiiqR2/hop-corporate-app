export type RegisterType = {
  countryCode: string;
  phone: string;
  vehicleDocs: {
    vehicle_picture: any,
    identification_picture: any,
    seremi: any,
    curriculum_vitae: any,
    permission: any,
    secure: any,
  };
  email: string;
  password: string;
  role: string;
  userInfo: {
    firstName: string;
    lastName: string;
    rut: string;
    user_address: {
      address: string;
      latitude: number;
      longitude: number;
    },
    bank_name: any;
    bank_account_holder: string;
    bank_account_type: string;
    bank_account_rut: string;
    bank_account: string;
    birthdate: string;
    hotel_address: {
      name: string;
      address: string,
      latitude: number,
      longitude: number,
    }
  };
  vehicleData: {
    type: string;
    passengers: any,
    luggageSpace: any,
    specialLuggage: any,
    accessibility: any,
  }
}