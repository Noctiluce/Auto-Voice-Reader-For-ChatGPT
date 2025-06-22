// This extension does not collect, store, or transmit any personal data. All processing happens locally in your browser.
// An accessibility-focused tool that automatically clicks the voice playback button on AI chat interfaces like ChatGPT. Ideal for visually impaired users who rely on screen readers or voice output.
//Features:
// - Automatically activates voice reading when a new message appears
// - ON/OFF toggle for control
// - Lightweight and respectful of user privacy

// /!\ This extension is NOT affiliated with OpenAI or ChatGPT.
(function() 
{
  'use strict';
  
  let autoReadActive = true;
  let lastMessageCount = 0;
  let isInitialized = false;
  let pollingInterval = null;
  
  const CONFIG = 
  {
    POLLING_INTERVAL: 500,
    CLICK_DELAY: 100,
    INIT_DELAY: 500,
    LOG_ACTIVE: false
  };
  
  function logMessage(message) 
  {
    if (CONFIG.LOG_ACTIVE) 
    {
      console.log(message);
    }
  }

  function clickLastReadButton() 
  {
    try 
    {
      const voiceButtons = document.querySelectorAll('button[data-testid="voice-play-turn-action-button"]');
      
      if (voiceButtons.length > 0 && autoReadActive) 
      {
        const lastButton = voiceButtons[voiceButtons.length - 1];
        
        if (lastButton.getAttribute('data-state') === 'closed') 
        {
          logMessage('ARC clicking last read button');
          
          setTimeout(() => 
          {
            if (lastButton.offsetParent !== null) 
            {
              lastButton.click();
            }
          }, 100);
        } 
        else 
        {
          logMessage('ARC last read button not ready (data-state=' + lastButton.getAttribute('data-state') + ')');
        }
      }
    } 
    catch (error) 
    {
      console.warn('ARC Error while clicking the read button:', error);
    }
  }

  function checkForNewResponses() 
  {
    try 
    {
      const voiceButtons = document.querySelectorAll('button[data-testid="voice-play-turn-action-button"]');
      const currentMessageCount = voiceButtons.length;
      
      if (currentMessageCount < lastMessageCount) 
      {
        lastMessageCount = currentMessageCount;
      }
      
      if (currentMessageCount > lastMessageCount + 1)
      {
        lastMessageCount = currentMessageCount; 
      }
      
      if (currentMessageCount > lastMessageCount) 
      {
        logMessage(`ARC new response detected (${currentMessageCount} vs ${lastMessageCount})`);
        lastMessageCount = currentMessageCount;
        
        setTimeout(() => 
        {
          clickLastReadButton();
        }, CONFIG.CLICK_DELAY);
      }
    } 
    catch (error) 
    {
      console.warn('ARC Error during response check:', error);
    }
  }

  function addToggleButton() 
  {
    if (document.querySelector('#arc-auto-read-toggle')) 
    {
      return;
    }
    
    try 
    {
      const button = document.createElement("button");
      button.id = 'arc-auto-read-toggle';
      button.textContent = "🔊 Auto Read ON";
      
      Object.assign(button.style, 
      {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "10000",
        padding: "12px 16px",
        backgroundColor: "#4caf50",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.3s ease",
        userSelect: "none"
      });

      button.addEventListener('click', function(e) 
      {
        e.preventDefault();
        e.stopPropagation();
        
        autoReadActive = !autoReadActive;
        button.textContent = autoReadActive ? "🔊 Auto Read ON" : "🔇 Auto Read OFF";
        button.style.backgroundColor = autoReadActive ? "#4caf50" : "#f44336";
        logMessage(`ARC Auto-read ${autoReadActive ? 'enabled' : 'disabled'}`);
      });

      button.addEventListener('mouseenter', function() 
      {
        this.style.transform = 'scale(1.05)';
      });
      
      button.addEventListener('mouseleave', function() 
      {
        this.style.transform = 'scale(1)';
      });

      document.body.appendChild(button);
      logMessage('ARC Toggle button added');
      
    } 
    catch (error) 
    {
      console.error('ARC Error creating toggle button:', error);
    }
  }

  function startPolling() 
  {
    if (pollingInterval) 
    {
      clearInterval(pollingInterval);
    }
    
    pollingInterval = setInterval(checkForNewResponses, CONFIG.POLLING_INTERVAL);
    logMessage(`ARC Polling started with ${CONFIG.POLLING_INTERVAL}ms interval`);
  }

  function cleanup() 
  {
    if (pollingInterval) 
    {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function initialize() 
  {
    if (isInitialized) 
    {
      logMessage('ARC Script already initialized, skipping');
      return;
    }
    
    logMessage('ARC Initializing auto-read script');
    
    try 
    {
      cleanup();
      
      setTimeout(() => 
      {
        addToggleButton();
        startPolling();
        
        const voiceButtons = document.querySelectorAll('button[data-testid="voice-play-turn-action-button"]');
        lastMessageCount = voiceButtons.length;
        logMessage(`ARC Initial messages detected: ${lastMessageCount}`);
        
        isInitialized = true;
      }, CONFIG.INIT_DELAY);
      
    } 
    catch (error) 
    {
      console.error('ARC Initialization error:', error);
    }
  }

  function waitForDOMAndInitialize() 
  {
    if (document.readyState === 'loading') 
    {
      document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } 
    else 
    {
      setTimeout(initialize, 1000);
    }
  }

  window.addEventListener('beforeunload', cleanup);
  
  window.addEventListener('error', function(e) 
  {
    if (e.message && e.message.includes('ARC')) 
    {
      console.warn('ARC Error intercepted:', e.message);
    }
  });

  waitForDOMAndInitialize();
  
})();