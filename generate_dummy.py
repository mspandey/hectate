from PIL import Image, ImageDraw, ImageFont

img = Image.new('RGB', (400, 200), color = (255, 255, 255))
d = ImageDraw.Draw(img)

# We just need to put some text
text = "Name: Jane Doe\nDOB: 01/01/1990\nGender: Female\n1234 5678 9012"
d.text((10,10), text, fill=(0,0,0))

img.save('dummy_aadhaar.jpg')
