import React, { useState, useRef } from 'react';

const ToneCheatSheet = ({
  audioMap,
  voices,
  selectedVoice,
  onVoiceChange,
  isLoading,
  error,
}) => {
  const [activeRule, setActiveRule] = useState(null);
  
  // Color scheme
  const colors = {
    mid: { bg: '#FEF9C3', border: '#EAB308', text: '#854D0E' },
    high: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
    low: { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D' },
    live: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    dead: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
  };

  const toneColors = {
    สามัญ: '#6B7280',
    เอก: '#3B82F6', 
    โท: '#10B981',
    ตรี: '#F59E0B',
    จัตวา: '#EF4444',
  };

  const audioFor = (word) => audioMap?.[word];

  const audioRef = useRef(null);

  const baseAudioPath = selectedVoice?.basePath?.replace(/\/$/, '') || '/audio';

  const handlePlay = (file) => {
    if (!file) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    const primarySrc = `${baseAudioPath}/${file}`;
    const fallbackSrc = `/audio/${file}`;

    const playFrom = (src, allowFallback) => {
      audio.pause();
      audio.src = src;
      audio.currentTime = 0;
      audio.play().catch((err) => {
        if (allowFallback && src !== fallbackSrc) {
          playFrom(fallbackSrc, false);
          return;
        }
        // eslint-disable-next-line no-console
        console.error('Audio play failed', err);
      });
    };

    playFrom(primarySrc, true);
  };

  const rules = [
    {
      id: 1,
      consonant: 'กลาง',
      syllable: 'คำเป็น',
      base: 'สามัญ',
      count: 5,
      tones: [
        { shape: 'สามัญ', sound: 'สามัญ', example: 'กา', audio: audioFor('กา') },
        { shape: 'เอก', sound: 'เอก', example: 'ก่า', audio: audioFor('ก่า') },
        { shape: 'โท', sound: 'โท', example: 'ก้า', audio: audioFor('ก้า') },
        { shape: 'ตรี', sound: 'ตรี', example: 'ก๊า', audio: audioFor('ก๊า') },
        { shape: 'จัตวา', sound: 'จัตวา', example: 'ก๋า', audio: audioFor('ก๋า') },
      ],
      note: 'รูป = เสียง ตรงกันหมด'
    },
    {
      id: 2,
      consonant: 'กลาง',
      syllable: 'คำตาย',
      base: 'เอก',
      count: 4,
      tones: [
        { shape: '—', sound: 'เอก', example: 'จะ', audio: audioFor('จะ') },
        { shape: 'โท', sound: 'โท', example: 'จ้ะ', audio: audioFor('จ้ะ') },
        { shape: 'ตรี', sound: 'ตรี', example: 'จ๊ะ', audio: audioFor('จ๊ะ') },
        { shape: 'จัตวา', sound: 'จัตวา', example: 'จ๋ะ', audio: audioFor('จ๋ะ') },
      ],
      note: 'ไม่มีรูป → เสียงเอก'
    },
    {
      id: 3,
      consonant: 'สูง',
      syllable: 'คำเป็น',
      base: 'จัตวา',
      count: 3,
      tones: [
        { shape: '—', sound: 'จัตวา', example: 'ขา', audio: audioFor('ขา') },
        { shape: 'เอก', sound: 'เอก', example: 'ข่า', audio: audioFor('ข่า') },
        { shape: 'โท', sound: 'โท', example: 'ข้า', audio: audioFor('ข้า') },
      ],
      note: 'ไม่มีรูป → เสียงจัตวา'
    },
    {
      id: 4,
      consonant: 'สูง',
      syllable: 'คำตาย',
      base: 'เอก',
      count: 2,
      tones: [
        { shape: '—', sound: 'เอก', example: 'ขะ', audio: audioFor('ขะ') },
        { shape: 'โท', sound: 'โท', example: 'ข้ะ', audio: audioFor('ข้ะ') },
      ],
      note: 'ผันได้น้อยที่สุด'
    },
    {
      id: 5,
      consonant: 'ต่ำ',
      syllable: 'คำเป็น',
      base: 'สามัญ',
      count: 3,
      tones: [
        { shape: '—', sound: 'สามัญ', example: 'คา', audio: audioFor('คา') },
        { shape: 'เอก', sound: 'โท', example: 'ค่า', audio: audioFor('ค่า') },
        { shape: 'โท', sound: 'ตรี', example: 'ค้า', audio: audioFor('ค้า') },
      ],
      note: 'รูป ≠ เสียง (เลื่อนขึ้น 1)'
    },
    {
      id: 6,
      consonant: 'ต่ำ',
      syllable: 'คำตาย สระสั้น',
      base: 'ตรี',
      count: 3,
      tones: [
        { shape: '—', sound: 'ตรี', example: 'คะ', audio: audioFor('คะ') },
        { shape: 'เอก', sound: 'โท', example: 'ค่ะ', audio: audioFor('ค่ะ') },
        { shape: 'จัตวา', sound: 'จัตวา', example: 'ค๋ะ', audio: audioFor('ค๋ะ') },
      ],
      note: 'พื้นเสียงตรี'
    },
    {
      id: 7,
      consonant: 'ต่ำ',
      syllable: 'คำตาย สระยาว',
      base: 'โท',
      count: 2,
      tones: [
        { shape: '—', sound: 'โท', example: 'โคก', audio: audioFor('โคก') },
        { shape: 'โท', sound: 'ตรี', example: 'โค้ก', audio: audioFor('โค้ก') },
      ],
      note: 'พื้นเสียงโท'
    },
  ];

  const ToneBadge = ({ tone, isSound = false }) => (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: isSound ? toneColors[tone] : 'transparent',
        color: isSound ? 'white' : toneColors[tone],
        border: isSound ? 'none' : `2px solid ${toneColors[tone]}`,
        minWidth: '45px',
      }}
    >
      {tone}
    </span>
  );

  const HandDiagram = ({ count, tones }) => {
    const fingers = [
      { x: 15, y: 5, height: 28 },   // thumb
      { x: 32, y: 0, height: 38 },   // index
      { x: 50, y: 0, height: 42 },   // middle
      { x: 68, y: 2, height: 38 },   // ring
      { x: 85, y: 8, height: 30 },   // pinky
    ];
    
    return (
      <svg viewBox="0 0 100 80" style={{ width: '80px', height: '64px' }}>
        {/* Palm */}
        <ellipse cx="50" cy="60" rx="35" ry="18" fill="#FECACA" stroke="#F87171" strokeWidth="1"/>
        {/* Fingers */}
        {fingers.map((finger, i) => {
          const isActive = i < count;
          const tone = tones[i];
          return (
            <g key={i}>
              <rect
                x={finger.x - 6}
                y={finger.y}
                width="12"
                height={finger.height}
                rx="6"
                fill={isActive ? toneColors[tone?.sound] || '#D1D5DB' : '#E5E7EB'}
                stroke={isActive ? '#374151' : '#9CA3AF'}
                strokeWidth="1"
              />
              {isActive && tone && (
                <text
                  x={finger.x}
                  y={finger.y + finger.height / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="6"
                  fontWeight="bold"
                >
                  {tone.sound[0]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const RuleCard = ({ rule, isActive, onClick }) => {
    const consonantColor = rule.consonant === 'กลาง' ? colors.mid : 
                          rule.consonant === 'สูง' ? colors.high : colors.low;
    const syllableColor = rule.syllable.includes('เป็น') ? colors.live : colors.dead;
    
    return (
      <div
        onClick={onClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isActive ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isActive 
            ? '0 20px 40px rgba(0,0,0,0.15), 0 0 0 3px ' + consonantColor.border
            : '0 4px 12px rgba(0,0,0,0.08)',
          border: `2px solid ${isActive ? consonantColor.border : '#E5E7EB'}`,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{
            backgroundColor: consonantColor.bg,
            color: consonantColor.text,
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            border: `1px solid ${consonantColor.border}`,
          }}>
            อักษร{rule.consonant}
          </span>
          <span style={{
            backgroundColor: syllableColor.bg,
            color: syllableColor.text,
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            border: `1px solid ${syllableColor.border}`,
          }}>
            {rule.syllable}
          </span>
        </div>
        
        {/* Hand + Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HandDiagram count={rule.count} tones={rule.tones} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: '#1F2937',
              lineHeight: 1,
            }}>
              {rule.count} <span style={{ fontSize: '14px', fontWeight: '500', color: '#6B7280' }}>เสียง</span>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6B7280',
              marginTop: '4px',
            }}>
              พื้นเสียง: <ToneBadge tone={rule.base} isSound />
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {isActive && (
          <div style={{ 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '2px dashed #E5E7EB',
            animation: 'fadeIn 0.3s ease',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB' }}>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600' }}>รูป</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600' }}>เสียง</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: '600' }}>ตัวอย่าง</th>
                </tr>
              </thead>
              <tbody>
                {rule.tones.map((tone, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      {tone.shape === '—' ? (
                        <span style={{ color: '#9CA3AF', fontSize: '16px' }}>—</span>
                      ) : (
                        <ToneBadge tone={tone.shape} />
                      )}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <ToneBadge tone={tone.sound} isSound />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px' 
                      }}>
                        <span style={{ 
                          fontSize: '18px',
                          fontWeight: '600',
                          color: toneColors[tone.sound],
                        }}>
                          {tone.example}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (tone.audio) {
                              handlePlay(tone.audio);
                            }
                          }}
                          style={{
                            border: `1px solid ${toneColors[tone.sound]}`,
                            backgroundColor: 'white',
                            color: toneColors[tone.sound],
                            borderRadius: '999px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: tone.audio ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                          }}
                          disabled={!tone.audio}
                          aria-label={`เล่นเสียง ${tone.example}`}
                        >
                          🔊 เล่น
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#92400E',
              fontWeight: '500',
            }}>
              💡 {rule.note}
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasVoices = Array.isArray(voices) && voices.length > 0;
  const voiceSelectValue = selectedVoice?.id ?? '';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: '"Noto Sans Thai", "Sarabun", sans-serif',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #3B82F6, #EC4899)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px',
        }}>
          การผันวรรณยุกต์
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          กดที่การ์ดเพื่อดูรายละเอียด
        </p>
      </div>

      {/* Voice selector */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto 20px',
        padding: '14px 16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '700', color: '#1F2937' }}>เลือกเสียง</span>
          <select
            value={voiceSelectValue}
            onChange={(e) => onVoiceChange?.(e.target.value)}
            disabled={!hasVoices}
            style={{
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '13px',
              minWidth: '180px',
              backgroundColor: hasVoices ? 'white' : '#F3F4F6',
              color: hasVoices ? '#111827' : '#9CA3AF',
              cursor: hasVoices ? 'pointer' : 'not-allowed',
            }}
          >
            {hasVoices ? voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label || voice.id}
              </option>
            )) : <option value="">ไม่มีรายการเสียง</option>}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end', minWidth: '220px' }}>
          <div style={{ fontSize: '12px', color: '#4B5563', textAlign: 'right' }}>
            {isLoading && 'กำลังโหลดรายการเสียง...'}
            {!isLoading && selectedVoice?.description}
            {!isLoading && !hasVoices && !error && 'ยังไม่มีรายการเสียงในไฟล์ voices.json'}
            {error && <span style={{ color: '#DC2626' }}>{error}</span>}
          </div>
          <button
            onClick={() => handlePlay(selectedVoice?.sample)}
            disabled={!selectedVoice?.sample}
            style={{
              border: '1px solid #3B82F6',
              backgroundColor: selectedVoice?.sample ? '#EFF6FF' : '#F3F4F6',
              color: '#1D4ED8',
              borderRadius: '999px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: selectedVoice?.sample ? 'pointer' : 'not-allowed',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              minWidth: '80px',
            }}
            aria-label="เล่นเสียงตัวอย่าง"
          >
            🔊 ตัวอย่าง
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>อักษร:</span>
          <span style={{ ...badgeStyle(colors.mid), fontSize: '12px' }}>กลาง 9</span>
          <span style={{ ...badgeStyle(colors.high), fontSize: '12px' }}>สูง 11</span>
          <span style={{ ...badgeStyle(colors.low), fontSize: '12px' }}>ต่ำ 24</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: '600', fontSize: '13px', color: '#374151' }}>พยางค์:</span>
          <span style={{ ...badgeStyle(colors.live), fontSize: '12px' }}>คำเป็น</span>
          <span style={{ ...badgeStyle(colors.dead), fontSize: '12px' }}>คำตาย</span>
        </div>
      </div>

      {/* Flowchart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {rules.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            isActive={activeRule === rule.id}
            onClick={() => setActiveRule(activeRule === rule.id ? null : rule.id)}
          />
        ))}
      </div>

      {/* Quick Reference */}
      <div style={{
        marginTop: '32px',
        maxWidth: '800px',
        margin: '32px auto 0',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: '#1F2937',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          🔑 จำง่าย ๆ
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: colors.mid.bg, borderRadius: '12px', border: `1px solid ${colors.mid.border}` }}>
            <div style={{ fontWeight: '700', color: colors.mid.text, marginBottom: '8px' }}>อักษรกลาง</div>
            <div style={{ fontSize: '13px', color: '#4B5563' }}>
              <div>ก จ ฎ ฏ ด ต บ ป อ</div>
              <div style={{ marginTop: '4px', fontStyle: 'italic' }}>"ไก่ จิก เด็ก ตาย บน ปาก โอ่ง"</div>
            </div>
          </div>
          
          <div style={{ padding: '12px', backgroundColor: colors.high.bg, borderRadius: '12px', border: `1px solid ${colors.high.border}` }}>
            <div style={{ fontWeight: '700', color: colors.high.text, marginBottom: '8px' }}>อักษรสูง</div>
            <div style={{ fontSize: '13px', color: '#4B5563' }}>
              <div>ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห</div>
              <div style={{ marginTop: '4px', fontStyle: 'italic' }}>"ผี ฝาก ถุง ข้าว สาร ให้ ฉัน"</div>
            </div>
          </div>
          
          <div style={{ padding: '12px', backgroundColor: colors.low.bg, borderRadius: '12px', border: `1px solid ${colors.low.border}` }}>
            <div style={{ fontWeight: '700', color: colors.low.text, marginBottom: '8px' }}>อักษรต่ำเดี่ยว</div>
            <div style={{ fontSize: '13px', color: '#4B5563' }}>
              <div>ง ญ ณ น ม ย ร ล ว ฬ</div>
              <div style={{ marginTop: '4px', fontStyle: 'italic' }}>"งู ใหญ่ นอน อยู่ ณ ริม วัด โม ฬี โลก"</div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#FEF2F2',
          borderRadius: '12px',
          border: '1px solid #FECACA',
        }}>
          <div style={{ fontWeight: '700', color: '#991B1B', marginBottom: '8px' }}>⚠️ ข้อห้ามสำคัญ</div>
          <div style={{ fontSize: '13px', color: '#7F1D1D' }}>
            อักษรสูงและอักษรต่ำ <strong>ห้ามใช้รูปวรรณยุกต์ตรี (  ๊ ) และจัตวา (  ๋ )</strong> เด็ดขาด!
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const badgeStyle = (color) => ({
  backgroundColor: color.bg,
  color: color.text,
  padding: '4px 10px',
  borderRadius: '6px',
  fontWeight: '600',
  border: `1px solid ${color.border}`,
});

export default ToneCheatSheet;
