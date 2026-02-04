import type { OrganizePlan } from '../types/electron';

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

export const handleGenerateOrganizePlan = async () => {
  const result = await window.electronAPI.generateOrganizePlan();
  console.log('generateOrganizePlan result', result);
  return result;
};

export const handleExecuteOrganizePlan = async (plan: OrganizePlan) => {
  const result = await window.electronAPI.executeOrganizePlan(plan);
  console.log('executeOrganizePlan result', result);
  return result;
};
