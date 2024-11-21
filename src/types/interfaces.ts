export type CheckoutItem = {
    id: string;
    name: string;
    quantity: number;
  }
  
export type Item = {
    id: string;
    name: string;
  }

export type AddVolunteerModalProps = {
  addModal: boolean;
  handleAddClose: () => void;
  fetchData: () => void;
};

export type Volunteer = {
  id: number;
  name: string;
  active: boolean;
  created_at: string ;
  last_signed_in: string| null;
  PIN: string;
};
