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
import { ASK_DATA_MODEL } from '../types/constants';
import { downloadCsv } from '../utils/csvExport';
import PanelCard from '../components/Analytics/PanelCard';
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

  const toggle = () => setExpanded((open) => !open);

  const submit = () => {
    const trimmed = question.trim();
    if (trimmed && !isLoading) ask(trimmed);
  };

  return (
    <PanelCard>
      <Stack sx={{ gap: expanded ? 3 : 0 }}>
        <Stack
          direction="row"
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <RobotOutlined aria-label="AI powered" />
            <Typography variant="h5">Ask the Data</Typography>
          </Stack>
          <Box sx={{ display: 'flex', p: 1, color: 'text.secondary' }}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </Box>
        </Stack>

        <Collapse in={expanded} unmountOnExit>
          <Stack sx={{ gap: 3 }}>
            <Stack sx={{ gap: 1 }}>
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
              <Typography
                sx={{ typography: 'caption', color: 'text.secondary' }}
              >
                Ask a question in plain English and get an answer straight from
                live data.
              </Typography>
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

            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{ typography: 'caption', color: 'text.secondary' }}
              >
                {[
                  answer?.model ?? ASK_DATA_MODEL,
                  answer && `${answer.totalTokens.toLocaleString()} tokens`,
                  answer?.questionLimit &&
                    `${answer.questionsUsed} of ${answer.questionLimit} questions`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
              <Stack direction="row" sx={{ gap: 1, ml: 'auto', flexShrink: 0 }}>
                <Button
                  size="small"
                  startIcon={<DownloadOutlined />}
                  sx={{ whiteSpace: 'nowrap' }}
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
                  sx={{ whiteSpace: 'nowrap' }}
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
