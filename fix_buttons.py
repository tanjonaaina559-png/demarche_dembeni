import os

file_path = "frontend/src/pages/citizen/NewRequest.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix previous button
content = content.replace(
    '<ArrowLeft size={16} /> PrÃ©cÃ©dent',
    '<ArrowLeft size={16} /> <span>PrÃ©cÃ©dent</span>'
)

# Fix next button
content = content.replace(
    'Suivant <ArrowRight size={16} />',
    '<span>Suivant</span> <ArrowRight size={16} />'
)

# Add key to next button
content = content.replace(
    '{currentStep < 3 ? (\n              <button \n                type="button" \n                onClick={nextStep}',
    '{currentStep < 3 ? (\n              <button \n                key="btn-next"\n                type="button" \n                onClick={nextStep}'
)

# Add key to submit button
content = content.replace(
    ') : (\n              <button \n                type="button" \n                onClick={handleSubmit}',
    ') : (\n              <button \n                key="btn-submit"\n                type="button" \n                onClick={handleSubmit}'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Buttons fixed!")
