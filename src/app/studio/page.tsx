const handlePublishTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !selectedFile) return;
    setPublishing(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await database.storage.from('audio-tracks').upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = database.storage.from('audio-tracks').getPublicUrl(fileName);
      
      // Fixed metadata mappings to ensure perfect compatibility with your sounds table schema
      const { error: tableError } = await database.from('sounds').insert([{ 
        title: trackTitle.trim(), 
        genre: trackGenre, 
        audio_url: publicUrl, 
        profile_id: user.id, 
        bpm: trackBpm, 
        key: trackKey,          // Keeps fallback matching intact
        musical_key: trackKey,  // Also maps to musical_key to support older schema versions!
        mood: trackMood 
      }]);
      if (tableError) throw tableError;

      setTrackTitle('');
      setSelectedFile(null);
      setShareType('none');
      
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      if (sounds) setMySounds(sounds);
      
      await loadFeedAndProfiles();
    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };
