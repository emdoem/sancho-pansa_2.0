export const handleGetUserDataPath = async () => {
  const userDataPath = await window.electronAPI.exposeUserDataPath();
  console.log('userDataPath', userDataPath);
  return userDataPath;
};