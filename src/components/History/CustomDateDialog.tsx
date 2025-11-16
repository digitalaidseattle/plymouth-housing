import DialogTemplate from '../DialogTemplate';
type CustomDateDialogProps = {
  showDialog: boolean;
  handleShowDialog: () => void;
};

const CustomDateDialog = ({
  showDialog,
  handleShowDialog,
}: CustomDateDialogProps) => {
  return (
    <DialogTemplate showDialog={showDialog} handleShowDialog={handleShowDialog}>
      custom date picker
    </DialogTemplate>
  );
};

export default CustomDateDialog;
