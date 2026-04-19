import { Typography } from "@mui/material";
import { ReactNode } from "react";

export interface PageHeadingProps {
  title: string | ReactNode;
}

const PageHeading = ({ title }: PageHeadingProps) => {
    return (
        <Typography variant="h3">
            {title}
        </Typography>
    )
}

export default PageHeading;