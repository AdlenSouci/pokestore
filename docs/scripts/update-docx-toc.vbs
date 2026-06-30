' Met a jour la table des matieres + numeros de page (Word doit etre ferme).
If WScript.Arguments.Count = 0 Then WScript.Quit 1

path = WScript.Arguments(0)
Set word = CreateObject("Word.Application")
word.Visible = False
word.DisplayAlerts = 0

Set doc = word.Documents.Open(path, False, False, False)
doc.Repaginate

Dim i
For i = 1 To doc.TablesOfContents.Count
    doc.TablesOfContents(i).Update
Next

doc.Fields.Update
doc.Save
doc.Close False
word.Quit

Set doc = Nothing
Set word = Nothing
WScript.Quit 0
