const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("No file was selected.");
      return;
    }

    // Safety check: verify profile session id is fully loaded before continuing
    if (!profile || !profile.id) {
      alert("Auth error: Producer profile data has not fully loaded yet. Please wait a moment or try refreshing the studio workspace.");
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      console.log("Starting asset upload to Supabase bucket 'audio'...", fileName);

      // 1. Upload asset binary directly to public bucket store
      const { error: uploadError } = await database.storage
        .from('audio') 
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error("Supabase Storage Error: " + uploadError.message);
      }

      // 2. Fetch the resolved asset distribution address
      const { data: urlData } = database.storage.from('audio').getPublicUrl(fileName);
      if (!urlData || !urlData.publicUrl) {
        throw new Error("Could not resolve asset delivery path address from bucket.");
      }

      console.log("Asset stored successfully. Delivery URL:", urlData.publicUrl);

      // 3. Mount the record properties into your sounds schema table
      const { error: insertError } = await database.from('sounds').insert({
        profile_id: profile.id,
        title: file.name,
        category: activeTab,
        audio_url: urlData.publicUrl
      });

      if (insertError) {
        throw new Error("Database Table Entry Error: " + insertError.message);
      }

      // 4. Force state update to instantly refresh your component lists row template
      const { data: newSounds, error: fetchError } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('category', activeTab);
        
      if (fetchError) throw fetchError;

      setSounds(newSounds || []);
      alert("🎉 Sound file upload successfully distributed to the library feed!");

    } catch (error: any) {
      console.error("Studio audio upload pipeline critical error:", error);
      alert("❌ Upload Process Failed:\n" + (error.message || "Unknown database error connection timeout. Check your schema constraints."));
    } finally {
      // Clear target file value input track slot so the user can cleanly upload back-to-back entries
      e.target.value = '';
    }
  };
