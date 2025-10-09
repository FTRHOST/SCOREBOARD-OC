"use client";

import { useParams } from 'next/navigation';
import ScoreboardVoli1 from '@/components/scoreboards/volleyball/ScoreboardVoli1';
import ScoreboardVoli2 from '@/components/scoreboards/volleyball/ScoreboardVoli2';
import ScoreboardVoli3 from '@/components/scoreboards/volleyball/ScoreboardVoli3';

export default function VolleyballScoreboardPage() {
  const params = useParams();
  const model = params.model;

  const renderScoreboard = () => {
    switch (model) {
      case '1':
        return <ScoreboardVoli1 />;
      case '2':
        return <ScoreboardVoli2 />;
      case '3':
        return <ScoreboardVoli3 />;
      default:
        return <div>Model papan skor tidak ditemukan.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#00ff00] flex items-center justify-center">
      {renderScoreboard()}
    </div>
  );
}
