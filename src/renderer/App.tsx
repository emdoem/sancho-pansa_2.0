import { Stack } from '@mui/joy'
import { TopBar, LeftSidebar, MainContent, BottomBar } from './components'

function App() {
  return (
    <Stack 
      direction="column" 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '100vh'
      }}
    >
      <TopBar />
      <Stack 
        direction="row" 
        style={{ 
          width: '100%', 
          flex: 1,
          minHeight: 0
        }}
      >
        <LeftSidebar />
        <MainContent />
      </Stack>
      <BottomBar />
    </Stack>
  )
}

export default App
