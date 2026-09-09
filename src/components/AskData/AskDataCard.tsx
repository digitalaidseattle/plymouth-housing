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
  InputAdornment,
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
  CloseOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useAskData } from '../../hooks/useAskData';
import { downloadCsv } from '../../utils/csvExport';
import PanelCard from '../Analytics/PanelCard';
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
  const [expanded, setExpanded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
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
                  slotProps={{
                    htmlInput: { 'aria-label': 'Ask the data' },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            aria-label="Clear question"
                            onClick={() => setQuestion('')}
                            sx={{ visibility: question ? 'visible' : 'hidden' }}
                          >
                            <CloseOutlined />
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
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
                Answers are straight from the database.
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
                <Button
                  size="small"
                  onClick={() => setShowDetails((on) => !on)}
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </Button>
                <Collapse in={showDetails} sx={{ width: '100%' }}>
                  <Stack sx={{ gap: 1 }}>
                    <Box sx={codeSx}>{answer.sql}</Box>
                    <Typography
                      sx={{ typography: 'caption', color: 'text.secondary' }}
                    >
                      {`${answer.model} · ${answer.totalTokens.toLocaleString()} tokens · ${answer.questionsUsed} of ${answer.questionLimit} questions this hour`}
                    </Typography>
                  </Stack>
                </Collapse>
              </Stack>
            )}

            <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
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
                Export answer
              </Button>
              <Button
                size="small"
                startIcon={<ClearOutlined />}
                sx={{ whiteSpace: 'nowrap' }}
                disabled={isLoading}
                onClick={() => {
                  reset();
                  setQuestion('');
                  setShowDetails(false);
                }}
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Collapse>
      </Stack>
    </PanelCard>
  );
};

export default AskDataCard;
