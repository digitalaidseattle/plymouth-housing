/**
 *  AskDataCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  DownOutlined,
  UpOutlined,
  DownloadOutlined,
  ClearOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useAskData } from './useAskData';
import { downloadCsv } from '../utils/csvExport';
import PanelCard from '../components/AdminHome/PanelCard';
import AskDataResult from './AskDataResult';

const codeSx = {
  typography: 'caption',
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  bgcolor: 'grey.100',
  borderRadius: 1,
  p: 1.5,
};

const AskDataCard: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [showQuery, setShowQuery] = useState(false);
  const [question, setQuestion] = useState('');
  const { answer, isLoading, error, ask, reset } = useAskData();

  const submit = () => {
    const trimmed = question.trim();
    if (trimmed && !isLoading) ask(trimmed);
  };

  return (
    <PanelCard>
      <Stack sx={{ gap: expanded ? 3 : 0 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <RobotOutlined aria-label="AI powered" />
            <Typography variant="h5">Ask the Data</Typography>
          </Stack>
          <IconButton
            onClick={() => setExpanded((open) => !open)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </IconButton>
        </Stack>

        <Collapse in={expanded} unmountOnExit>
          <Stack sx={{ gap: 3 }}>
            <Stack direction="row" sx={{ gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="How many residents did we serve this month?"
                slotProps={{ htmlInput: { 'aria-label': 'Ask the data' } }}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
                disabled={isLoading}
              />
              <Button
                variant="contained"
                onClick={submit}
                disabled={isLoading || !question.trim()}
              >
                Ask
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ whiteSpace: 'pre-wrap' }}>
                {error}
              </Alert>
            )}

            {isLoading && <Skeleton variant="rounded" height={160} />}

            {!isLoading && answer && (
              <Stack sx={{ gap: 1, alignItems: 'flex-start' }}>
                <AskDataResult answer={answer} />
                <Button size="small" onClick={() => setShowQuery((on) => !on)}>
                  {showQuery ? 'Hide query' : 'Show query'}
                </Button>
                <Collapse in={showQuery} sx={{ width: '100%' }}>
                  <Box sx={codeSx}>{answer.sql}</Box>
                </Collapse>
              </Stack>
            )}

            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography
                sx={{ typography: 'caption', color: 'text.secondary' }}
              >
                Ask in plain English · Answered live from the database
                {answer ? ` · ${answer.totalTokens} tokens` : ''}
              </Typography>
              <Stack direction="row" sx={{ gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<DownloadOutlined />}
                  onClick={() =>
                    answer &&
                    downloadCsv(
                      `ask-data-${Date.now()}.csv`,
                      answer.columns,
                      answer.rows,
                    )
                  }
                  disabled={!answer || isLoading}
                >
                  Export CSV
                </Button>
                <Button
                  size="small"
                  startIcon={<ClearOutlined />}
                  disabled={isLoading}
                  onClick={() => {
                    reset();
                    setQuestion('');
                    setShowQuery(false);
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
    </PanelCard>
  );
};

export default AskDataCard;
