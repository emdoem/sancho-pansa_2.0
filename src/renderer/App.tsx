import { Stack } from '@mui/joy';
import { TopBar, LeftSidebar, BottomBar } from './components/organisms';
import { MainContent } from './components/templates';

function App() {
  const displayPlayer = false; // Placeholder for player display logic
  return (
    <Stack
      direction="column"
      style={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
      }}
    >
      <TopBar />
      <Stack
        direction="row"
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}
      >
        <LeftSidebar />
        <MainContent />
      </Stack>
      {displayPlayer && <BottomBar />}
    </Stack>
  );
}

export default App;
