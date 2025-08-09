import React from 'react';
import {
  Skeleton,
  Card,
  CardContent,
  Box,
  Stack,
} from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'form' | 'card' | 'list' | 'text';
  count?: number;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  count = 1,
  height = 40,
  animation = 'wave',
}) => {
  const renderFormSkeleton = () => (
    <Card elevation={1}>
      <CardContent sx={{ p: 4 }}>
        <Skeleton
          variant="text"
          width="60%"
          height={40}
          animation={animation}
          sx={{ mb: 2 }}
        />
        <Skeleton
          variant="text"
          width="40%"
          height={20}
          animation={animation}
          sx={{ mb: 4 }}
        />

        <Stack spacing={3}>
          {Array.from({ length: count }).map((_, index) => (
            <Box key={index}>
              <Skeleton
                variant="text"
                width="30%"
                height={20}
                animation={animation}
                sx={{ mb: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={56}
                animation={animation}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Skeleton
            variant="rectangular"
            width={120}
            height={40}
            animation={animation}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={100}
            height={40}
            animation={animation}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderCardSkeleton = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', lg: '1 1 calc(33.333% - 16px)' } }}>
          <Card elevation={1}>
            <CardContent sx={{ p: 3 }}>
              <Skeleton
                variant="text"
                width="80%"
                height={28}
                animation={animation}
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={20}
                animation={animation}
                sx={{ mb: 1 }}
              />
              <Skeleton
                variant="text"
                width="40%"
                height={20}
                animation={animation}
                sx={{ mb: 2 }}
              />

              <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={24}
                  animation={animation}
                  sx={{ borderRadius: 3 }}
                />
                <Skeleton
                  variant="rectangular"
                  width={50}
                  height={24}
                  animation={animation}
                  sx={{ borderRadius: 3 }}
                />
              </Box>

              <Skeleton
                variant="rectangular"
                width="100%"
                height={40}
                animation={animation}
                sx={{ borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

  const renderListSkeleton = () => (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={24}
            height={24}
            animation={animation}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton
              variant="text"
              width="70%"
              height={24}
              animation={animation}
              sx={{ mb: 0.5 }}
            />
            <Skeleton
              variant="text"
              width="50%"
              height={20}
              animation={animation}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton
              variant="rectangular"
              width={32}
              height={32}
              animation={animation}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={32}
              height={32}
              animation={animation}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );

  const renderTextSkeleton = () => (
    <Stack spacing={1}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === count - 1 ? '60%' : '100%'}
          height={height}
          animation={animation}
        />
      ))}
    </Stack>
  );

  switch (variant) {
    case 'form':
      return renderFormSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'list':
      return renderListSkeleton();
    default:
      return renderTextSkeleton();
  }
};

export default LoadingSkeleton;