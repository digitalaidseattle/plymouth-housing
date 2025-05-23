import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface PageHeadingProps {
  title: string | ReactNode;
}

const PageHeading = ({ title }: PageHeadingProps) => {
    return (
        <Typography sx={{ 
            variant: 'h3',
            fontSize: '28px' }}>
            {title}
        </Typography>
    )
}

export default PageHeading;