import type { Track } from "@/renderer/types/electron";

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

export interface TableConfig {
  showCheckboxes: boolean;
  selectedTrackIds: Set<string>;
  isAllSelected: boolean;
  onToggleSelect: (trackId: string) => void;
  onSelectAll: () => void;
}

export interface TrackTableProps {
  tracks: Track[];
  columns: Column<Track>[];
  tableConfig: TableConfig;
}

