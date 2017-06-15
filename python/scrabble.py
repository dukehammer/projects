import itertools
dictionary = open('scrabble.txt', 'r').read().split('\n')
letterpool = open('alphabet.txt', 'r').read().split('\n')
wordbank = []
answers = []

wordsize = 2

#dictionary = ['am', 'is', 'an', 'no', 'sin', 'not', 'nor', 'sim', 'mop']
#letterpool = ['a', 'm', 'i', 's', 'n', 'o', 'p', 'r', 'l', 'q', 'd']

# Get unique list of letter combinations
for letters in list(itertools.permutations(letterpool, pow(wordsize, 2))):
	words = []
	# Split into wordsize sized words
	for num in range(0, len(letters), wordsize):
		word = ''.join(letters[num:wordsize+num])
		words.append(word)
	if words not in wordbank:
		wordbank.append(words)

for words in wordbank:
	if all(word in dictionary for word in words):
		answers.append(words)

'''
for words in wordbank:
	for word in words:
		if word in dictionary:
			if word not in answers:
				answers.append(word)
'''

print(answers)