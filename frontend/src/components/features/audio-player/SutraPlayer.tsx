import React, { useState, useRef, useEffect } from 'react';
import { Sutra } from '../../../types';

const SutraPlayer: React.FC = () => {
  const [selectedSutra, setSelectedSutra] = useState<Sutra | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showText, setShowText] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sutras: Sutra[] = [
    {
      id: 'heart-sutra',
      title: '般若波罗蜜多心经',
      author: '玄奘大师译',
      description: '佛教般若类经典的核心，阐述空性智慧，净化心灵',
      audioUrl: '/audio/heart-sutra.mp3', // 实际项目中需要真实音频文件
      textUrl: '/texts/heart-sutra.txt',
      duration: 180, // 3分钟
      category: 'buddhist',
    },
    {
      id: 'diamond-sutra',
      title: '金刚般若波罗蜜经',
      author: '鸠摩罗什译',
      description: '破除执着，证悟空性，是大乘佛教重要经典',
      audioUrl: '/audio/diamond-sutra.mp3',
      textUrl: '/texts/diamond-sutra.txt',
      duration: 1800, // 30分钟
      category: 'buddhist',
    },
    {
      id: 'tao-te-ching',
      title: '道德经',
      author: '老子',
      description: '道家经典，阐述无为而治的哲学思想',
      audioUrl: '/audio/tao-te-ching.mp3',
      textUrl: '/texts/tao-te-ching.txt',
      duration: 2400, // 40分钟
      category: 'taoist',
    },
    {
      id: 'great-compassion-mantra',
      title: '大悲咒',
      author: '观世音菩萨',
      description: '观音菩萨的根本咒语，具有强大的加持力',
      audioUrl: '/audio/great-compassion-mantra.mp3',
      textUrl: '/texts/great-compassion-mantra.txt',
      duration: 300, // 5分钟
      category: 'buddhist',
    },
  ];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [selectedSutra]);

  const selectSutra = (sutra: Sutra) => {
    if (selectedSutra?.id === sutra.id) return;
    
    setSelectedSutra(sutra);
    setIsPlaying(false);
    setCurrentTime(0);
    setShowText(false);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !selectedSutra) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // 模拟音频播放（实际项目中会播放真实音频）
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (newVolume: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const changePlaybackSpeed = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: Sutra['category']) => {
    const icons = {
      buddhist: '🙏',
      taoist: '☯️',
      confucian: '📚',
    };
    return icons[category];
  };

  const getCategoryName = (category: Sutra['category']) => {
    const names = {
      buddhist: '佛教经典',
      taoist: '道教经典', 
      confucian: '儒家经典',
    };
    return names[category];
  };

  // 模拟经文内容
  const getSutraText = (sutraId: string) => {
    const texts: Record<string, string> = {
      'heart-sutra': `观自在菩萨，行深般若波罗蜜多时，照见五蕴皆空，度一切苦厄。
舍利子，色不异空，空不异色，色即是空，空即是色，受想行识，亦复如是。
舍利子，是诸法空相，不生不灭，不垢不净，不增不减。
是故空中无色，无受想行识，无眼耳鼻舌身意，无色声香味触法...`,
      'diamond-sutra': `如是我闻，一时，佛在舍卫国祇树给孤独园，与大比丘众千二百五十人俱。
尔时，世尊食时，著衣持钵，入舍卫大城乞食。于其城中，次第乞已，还至本处。
饭食讫，收衣钵，洗足已，敷座而坐...`,
      'tao-te-ching': `道可道，非常道。名可名，非常名。
无名天地之始，有名万物之母。
故常无欲，以观其妙；常有欲，以观其徼。
此两者，同出而异名，同谓之玄。玄之又玄，众妙之门...`,
      'great-compassion-mantra': `南无喝啰怛那哆啰夜耶，南无阿唎耶，婆卢羯帝烁钵啰耶，
菩提萨埵婆耶，摩诃萨埵婆耶，摩诃迦卢尼迦耶，
唵，萨皤啰罚曳，数怛那怛写，南无悉吉栗埵伊蒙阿唎耶...`,
    };
    return texts[sutraId] || '经文内容加载中...';
  };

  return (
    <div className="zen-container">
      <div className="zen-card">
        <div className="zen-icon">📖</div>
        <h1 className="zen-title">经典诵读</h1>
        <p className="zen-text zen-text-center">
          聆听智慧之声，净化心灵，增长福慧
        </p>
      </div>

      {/* 经典选择 */}
      <div className="zen-card">
        <h3 className="zen-subtitle">选择经典</h3>
        <div className="zen-grid zen-grid-2">
          {sutras.map((sutra) => (
            <div
              key={sutra.id}
              className={`zen-card ${selectedSutra?.id === sutra.id ? 'zen-glow' : ''}`}
              style={{ 
                cursor: 'pointer',
                border: selectedSutra?.id === sutra.id ? '2px solid var(--zen-gold)' : undefined,
              }}
              onClick={() => selectSutra(sutra)}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                  {getCategoryIcon(sutra.category)}
                </span>
                <div>
                  <h4 style={{ margin: '0', fontSize: '1.1rem' }}>{sutra.title}</h4>
                  <p style={{ margin: '0', fontSize: '0.8rem', opacity: 0.7 }}>
                    {sutra.author} • {getCategoryName(sutra.category)}
                  </p>
                </div>
              </div>
              
              <p className="zen-text" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                {sutra.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                <span>时长: {formatTime(sutra.duration)}</span>
                <span>{selectedSutra?.id === sutra.id ? '✅ 已选择' : '点击选择'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 播放器 */}
      {selectedSutra && (
        <div className="zen-card">
          <h3 className="zen-subtitle">正在播放</h3>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {getCategoryIcon(selectedSutra.category)}
            </div>
            <h4>{selectedSutra.title}</h4>
            <p className="zen-text-muted">{selectedSutra.author}</p>
          </div>

          {/* 进度条 */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: '#f0f0f0', 
              borderRadius: '4px',
              cursor: 'pointer',
              position: 'relative',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seekTo(percent * selectedSutra.duration);
            }}>
              <div style={{
                width: `${(currentTime / selectedSutra.duration) * 100}%`,
                height: '100%',
                background: 'var(--zen-gradient-gold)',
                borderRadius: '4px',
                transition: 'width 0.1s ease',
              }}></div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              color: 'var(--zen-wisdom)',
            }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(selectedSutra.duration)}</span>
            </div>
          </div>

          {/* 播放控制 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <button 
              className="zen-button zen-button-secondary"
              onClick={() => seekTo(Math.max(0, currentTime - 15))}
            >
              ⏪ 15s
            </button>
            
            <button 
              className="zen-button"
              onClick={togglePlay}
              style={{ fontSize: '1.5rem', padding: '1rem' }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <button 
              className="zen-button zen-button-secondary"
              onClick={() => seekTo(Math.min(selectedSutra.duration, currentTime + 15))}
            >
              15s ⏩
            </button>
          </div>

          {/* 音量和速度控制 */}
          <div className="zen-grid zen-grid-2" style={{ marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                🔊 音量: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                ⚡ 速度: {playbackSpeed}x
              </label>
              <select
                value={playbackSpeed}
                onChange={(e) => changePlaybackSpeed(parseFloat(e.target.value))}
                className="zen-input"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          {/* 功能按钮 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              className={`zen-button ${showText ? '' : 'zen-button-secondary'}`}
              onClick={() => setShowText(!showText)}
            >
              📄 {showText ? '隐藏' : '显示'}经文
            </button>
          </div>

          {/* 隐藏的音频元素（用于实际播放） */}
          <audio
            ref={audioRef}
            src={selectedSutra.audioUrl}
            preload="metadata"
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* 经文显示 */}
      {selectedSutra && showText && (
        <div className="zen-card">
          <h3 className="zen-subtitle">经文内容</h3>
          <div style={{
            background: 'rgba(212, 175, 55, 0.05)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            lineHeight: 2,
            fontSize: '1.1rem',
            textAlign: 'justify',
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            <div style={{ whiteSpace: 'pre-line' }}>
              {getSutraText(selectedSutra.id)}
            </div>
          </div>
          
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p className="zen-text-muted" style={{ fontSize: '0.9rem' }}>
              💡 建议：诵读时保持恭敬心，专注聆听，让智慧之声净化心灵
            </p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="zen-card">
        <h3 className="zen-subtitle">诵读指南</h3>
        <div className="zen-grid zen-grid-2">
          <div>
            <h4>🧘‍♂️ 诵读前准备</h4>
            <ul className="zen-text" style={{ paddingLeft: '1.5rem' }}>
              <li>选择安静的环境</li>
              <li>保持身心清净</li>
              <li>点燃一支香或静坐片刻</li>
            </ul>
          </div>
          <div>
            <h4>🙏 诵读时注意</h4>
            <ul className="zen-text" style={{ paddingLeft: '1.5rem' }}>
              <li>保持恭敬虔诚的心</li>
              <li>专注聆听，不被外物干扰</li>
              <li>可以跟读或默念</li>
            </ul>
          </div>
          <div>
            <h4>💫 诵读后回向</h4>
            <ul className="zen-text" style={{ paddingLeft: '1.5rem' }}>
              <li>将功德回向给众生</li>
              <li>祈愿世界和平安宁</li>
              <li>静坐几分钟体会法喜</li>
            </ul>
          </div>
          <div>
            <h4>📅 建议频率</h4>
            <ul className="zen-text" style={{ paddingLeft: '1.5rem' }}>
              <li>每日晨起或睡前</li>
              <li>心情烦躁时聆听</li>
              <li>重要节日多诵读</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SutraPlayer; 
 
 
 
 