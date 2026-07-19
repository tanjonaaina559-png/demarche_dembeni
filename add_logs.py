import os

file_path = "frontend/src/pages/citizen/NewRequest.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We want to add a wrapper component to each Step to log mount/unmount, but without breaking the code.
# The easiest way is to add a small component at the top of NewRequest.jsx
logger_component = """
const LifecycleLogger = ({ name, children }) => {
  React.useEffect(() => {
    console.log(`${name} MOUNT`);
    return () => console.log(`${name} UNMOUNT`);
  }, [name]);
  return <>{children}</>;
};
"""

if "const LifecycleLogger" not in content:
    content = content.replace("const STEPS = [", logger_component + "\nconst STEPS = [")

# Now wrap Step 1, 2, 3, 4 contents
content = content.replace(
    'key="step1"',
    'key="step1"\n              >\n                <LifecycleLogger name="STEP 1">'
).replace(
    'key="step2"',
    'key="step2"\n              >\n                <LifecycleLogger name="STEP 2">'
).replace(
    'key="step3"',
    'key="step3"\n              >\n                <LifecycleLogger name="STEP 3">'
).replace(
    'key="step4"',
    'key="step4"\n              >\n                <LifecycleLogger name="STEP 4">'
)

# Fix closing tags for LifecycleLogger
# We need to insert </LifecycleLogger> right before the closing </motion.div> of each step.
content = content.replace(
    '              </motion.div>\n            )}',
    '                </LifecycleLogger>\n              </motion.div>\n            )}'
)
# For step 4 it's a bit different
content = content.replace(
    '              </motion.div>\n              );\n            })()}',
    '                </LifecycleLogger>\n              </motion.div>\n              );\n            })()}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Logs added to NewRequest.jsx")
