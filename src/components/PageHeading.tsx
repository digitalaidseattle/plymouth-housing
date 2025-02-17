import { Typography } from "@mui/material";

export interface PageHeadingProps {
  title: string;
}

const PageHeading = ({ title }: PageHeadingProps) => {
    return (
        <Typography sx={{ 
            fontSize: '28px', 
            marginBottom: '2rem' }}>
            {title}
        </Typography>
    )
}

export default PageHeading;