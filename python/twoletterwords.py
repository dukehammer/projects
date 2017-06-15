import itertools
dictionary = open('scrabble.txt', 'r').read().split('\n')
letterpool = open('alphabet.txt', 'r').read().split('\n')
answers = []
wordbank = []

#dictionary = ['am', 'is', 'an', 'no']
#letterpool = ['a', 'm', 'i', 's', 'n', 'o', 'p', 'r']

for letters in list(itertools.permutations(letterpool, 2)):
	word = ''.join(letters)
	if word not in wordbank:
		wordbank.append(word)


for word in wordbank:
	if word in dictionary:
		if word not in answers:
			answers.append(word)

print(answers)