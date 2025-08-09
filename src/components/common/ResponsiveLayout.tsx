import React from 'react';
import { Container, Box } from '@mui/material';

interface ResponsiveLayoutProps {
    children: React.ReactNode;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    disableGutters?: boolean;
    fullHeight?: boolean;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
    children,
    maxWidth = 'lg',
    disableGutters = false,
    fullHeight = false,
}) => {

    return (
        <Container
            maxWidth={maxWidth}
            disableGutters={disableGutters}
            sx={{
                py: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
                px: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
                minHeight: fullHeight ? '100%' : 'auto',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: {
                        xs: 2,
                        sm: 3,
                        md: 4,
                    },
                    flex: fullHeight ? 1 : 'none',
                }}
            >
                {children}
            </Box>
        </Container>
    );
};

export default ResponsiveLayout;