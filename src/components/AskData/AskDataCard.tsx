/**
 *  AskDataCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState } from 'react';
import {
  Alert,
  Autocomplete,
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
import { useAskData } from '../../hooks/useAskData';
import usePersistentState from '../../hooks/usePersistentState';
import { SETTINGS } from '../../types/constants';
import { downloadCsv } from '../../utils/csvExport';
import PanelCard from '../Analytics/PanelCard';
import AskDataResult from './AskDataResult';

const RECENT_QUESTIONS_KEY = 'askDataRecentQuestions';

const codeSx = {
  typography: 'caption',
  whiteSpace: 'pre-wrap',
  bgcolor: 'grey.100',
  borderRadius: 1,
  p: 1.5,
};

const AskDataCard: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [question, setQuestion] = useState('');
  const [recentQuestions, setRecentQuestions] = usePersistentState<string[]>(
    RECENT_QUESTIONS_KEY,
    [],
  );
  const { answer, isLoading, error, ask, reset } = useAskData();

  const toggle = () => setExpanded((open) => !open);

  const submit = (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    setQuestion(trimmed);
    setRecentQuestions(
      [
        trimmed,
        ...recentQuestions.filter(
          (recent) => recent.toLowerCase() !== trimmed.toLowerCase(),
        ),
      ].slice(0, SETTINGS.askDataRecentQuestionsMax),
    );
    ask(trimmed);
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
                <Autocomplete
                  freeSolo
                  fullWidth
                  size="small"
                  disabled={isLoading}
                  clearText="Clear question"
                  options={recentQuestions}
                  inputValue={question}
                  onInputChange={(_, value) => setQuestion(value)}
                  // On key up, not down: Enter first lets the Autocomplete put
                  // the picked suggestion in the box, so Enter and the Ask
                  // button both send what the box shows.
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') submit();
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="How many residents did we serve this month?"
                      slotProps={{
                        ...params.slotProps,
                        htmlInput: {
                          ...params.slotProps.htmlInput,
                          'aria-label': 'Ask the data',
                        },
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  onClick={() => submit()}
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
              <Stack sx={{ gap: 2 }}>
                <AskDataResult answer={answer} />
                <Stack sx={{ gap: 1 }}>
                  <Button
                    variant="text"
                    size="small"
                    aria-expanded={showDetails}
                    onClick={() => setShowDetails((on) => !on)}
                    sx={{ alignSelf: 'flex-start', ml: -0.5 }}
                  >
                    {showDetails ? 'Hide details' : 'Show details'}
                  </Button>
                  <Collapse in={showDetails}>
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
