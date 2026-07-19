import re

path = 'frontend/src/pages/citizen/NewRequest.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the malformed closing tags for step 4
old_content = """                </div>
              );
              </motion.div>
              );
            })()}"""
            
new_content = """                </div>
              </motion.div>
              );
            })()}"""
            
content = content.replace(old_content, new_content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done fixing syntax")
