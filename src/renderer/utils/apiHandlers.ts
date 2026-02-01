export const handleGetUserDataPath = async () => {
  const userDataPath = await window.electronAPI.exposeUserDataPath();
  console.log('userDataPath', userDataPath);
  return userDataPath;
};

export const handleDetectDuplicates = async () => {
  const result = await window.electronAPI.detectDuplicates();
  console.log('detectDuplicates result', result);
  return result;
};
