import itertools

answers = []

dictionary = []
for word in open('scrabble.txt', 'r').read().split('\n'):
	if len(word) == 5:
		dictionary.append(word)

letterpool = ['a', 'b', 'c', 'f', 'g', 'j', 'k', 'l', 'q', 'r', 'u', 'x', 'z']

for letters in list(itertools.permutations(letterpool, 3)):
	word = letters[0] + 'n' + letters[1] + 'e' + letters[2]
	if word in dictionary:
		answers.append(word)

print(answers)