import java.awt.Point;
import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Lecture d'un fichier de définition de grille de mots croisés 
 * selon le format ".puz".
 * 
 * @author Guy Lapalme, Université de Montréal, 2011
 *
 */
public class Puzzle {

    private String header;
    private int nRows,nCols;
    private char[][] solution,diagram;
    private int[][] numbers;
    private List<String> clues;
    private String puzzleName, authorName, copyright;
    private String [] acrossClues,downClues; // définitions à l'anglaise

    /**
     * Création d'une structure à partir d'un fichier plus exactement un 
     * BufferedInputStream
	 *   Décodage d'un fichier .puz 
	 *   Méthode inspirée de krosswordplayer
	 *          <code>http://home.houston.rr.com/epasveer/<code>
	 *           en particulier fichiers: <tt>libacrosslite.cpp</tt>, <tt>libacrosslite.h</tt>
	 *                 Ernie Pasveer <tt><epasveer@houston.rr.com><tt>
     * 
     * @param bis
     */
    Puzzle(BufferedInputStream bis){
        try {
            readHeader(bis);
            solution = new char[nRows][nCols];
            readCharArray(bis,solution);
            diagram = new char[nRows][nCols];
            readCharArray(bis,diagram);
            readClues(bis,numberCells());
        } catch (IOException e){
            System.out.println("IOException:"+e);
        }
    }
    
    // accesseurs
    public String getHeader(){return header;}
    public int getNRows(){return nRows;}
    public int getNCols(){return nCols;}
    public char [][] getSolution(){return solution;}
    public char [][] getDiagram(){return diagram;}
    public int [][]  getNumbers(){return numbers;}
    public List<String> getClues(){return clues;}
    public String getPuzzleName(){return puzzleName;}
    public String getAuthorName(){return authorName;}
    public String getCopyright(){return copyright;}
    public String[] getAcrossClues(){return acrossClues;}
    public String[] getDownClues(){return downClues;}
    
    
    // forme chaîne d'un entier sur 2 colonnes
    private static String i2(int i){
        return (i<10?" ":"")+i;
    }
    
    /* 
     * Représentation chaîne de la structure complète d'un objet Puzzle
     * 
     * @see java.lang.Object#toString()
     */
    public String toString(){
        StringBuffer sb = new StringBuffer();
        
        sb.append("Grille:"+nRows+" x "+nCols).append('\n');
        sb.append("Numeros, Solution et Diagramme").append('\n');
        for(int r=0;r<nRows;r++){
            sb.append("    ");
            for(int c=0;c<nCols;c++){
                int n = numbers[r][c];
                if(n>0)
                    sb.append(i2(n));
                else 
                    sb.append("  ");
            }
            sb.append('\n');
            sb.append(i2(r+1)+": ");
            for(int c=0;c<nCols;c++)
                sb.append(" "+solution[r][c]);
            sb.append("  ");
            for(int c=0;c<nCols;c++)
                sb.append(" "+diagram[r][c]);
            sb.append('\n');
        }
        if(clues!=null){
        	sb.append("Author="+authorName).append('\n');
        	sb.append("Puzzle="+puzzleName).append('\n');
        	sb.append("Copyright="+copyright).append('\n');
        	sb.append(("Definitions lues")).append('\n');
        	int n=0;;
        	for(String clue:clues){
        		sb.append(i2(n)+": "+clue+"\n");
        		n++;
        	}
        }        
        if(acrossClues!=null){
            sb.append("Across").append('\n');
            for(int r=1;r<acrossClues.length;r++){
                if(acrossClues[r]!=null)
                    sb.append(i2(r)+": "+acrossClues[r]).append('\n');
            }
        }
        if(downClues!=null){
            sb.append("Down").append('\n');
            for(int r=1;r<downClues.length;r++){
                if(downClues[r]!=null)
                    sb.append(i2(r)+": "+downClues[r]).append('\n');
            }
        }
        return ""+sb;
    }

    /**
     * @param str chaîne d'entrée
     * @return la chaîne d'entrée dans laquelle les ' sont remplacées par \'
     */
    private String escapeQuote(String str){
    	return str==null?str:str.replaceAll("'", "\\\\'");
    }

    /**
     * @return structure JSON correspondant à l'objet puz
     */
    public String toJSON(){
    	StringBuilder js = new StringBuilder();
    	js.append("{ nCols:"+nCols+", nRows:"+nRows+",\n");
        js.append("author:'"+authorName).append("',\n");
        js.append("puzzle:'"+puzzleName).append("',\n");
        js.append("copyright:'"+copyright).append("',\n");
        js.append("diagram:[\n");
        boolean first=true;        
        for(int r=0;r<nRows;r++){
			if(first) first=false; else js.append(',');
        	js.append("'");
        	for(int c=0;c<nCols;c++)
        		js.append(diagram[r][c]);
        	js.append("'\n");
        }        	
        js.append("],\n");
        js.append("solution:[\n");
        first=true;        
        for(int r=0;r<nRows;r++){
			if(first) first=false; else js.append(',');
        	js.append("'");
        	for(int c=0;c<nCols;c++)
        		js.append(solution[r][c]);
        	js.append("'\n");
        }        	
        js.append("],\n");
        js.append("numbers:[\n");
        first=true;        
        for(int r=0;r<nRows;r++){
			if(first) first=false; else js.append(',');
        	js.append("[");
        	for(int c=0;c<nCols;c++){
        		js.append(numbers[r][c]);
        		if(c<nCols-1)js.append(",");
        	}
        	js.append("]\n");
        }        	
        js.append("],\n");
        js.append("acrossClues:[null\n");
        for(int r=1;r<acrossClues.length;r++){
        	if(acrossClues[r]==null)
        		js.append("  ,"+null+"\n");
        	else
        		js.append("  ,'"+escapeQuote(acrossClues[r])+"'\n");
        }
        js.append("],\n");
        js.append("downClues:[ null\n");
        for(int c=1;c<downClues.length;c++){
        	if(downClues[c]==null)
        		js.append("  ,"+null+"\n");
        	else
        		js.append("  ,'"+escapeQuote(downClues[c])+"'\n");
        }
        js.append("]");
        
    	return js+"}";
    }

    /**
     * Construire une chaîne à partir de caractères sur un BufferedInputStream 
     * on arrête au premier caractère NULL (0)
     * @param bis stream d'entrée
     * @return chaîne lue
     * @throws IOException
     */
    private String readString(BufferedInputStream bis) throws IOException{
        StringBuffer sb = new StringBuffer();
        int r;
        while((r=bis.read())>0)sb.append((char)r);
        return ""+sb;
    }
    
    
    /**
     * Lire l'entête du fichier pour obtenir le nombre de colonnes et de lignes
     * @param bis stream d'entree
     * @throws IOException
     */
    private void readHeader(BufferedInputStream bis) throws IOException{
        // sauter les 44 premiers bytes
        for(int r=0;r<44;r++)bis.read();
        nCols  = bis.read();
        nRows = bis.read();
        // sauter les 6 prochains bytes
        for(int r=0;r<6;r++)bis.read();
    }
    
    /**
     * Lire un tableau de caractères (grille ou solution) du nombre de lignes
     * et de caractères 
     * @param bis flot d'entree
     * @param array tableau des caractères qui seront lu, ce tableau doit avoir été créé avant l'appel
     * @throws IOException
     */
    private void readCharArray(BufferedInputStream bis,char [][] array)
        throws IOException{
            for(int r=0;r<nRows;r++){
                for(int c=0;c<nCols;c++)
                    array[r][c]=(char)bis.read();
            }
        }
    
    /**
     * Numéroter les cellules selon la méthode anglaise pour les mots croisés
     * Une cellule est numérotée si elle peut débuter un mot horizontal ou vertical
     * La numérotation débute en haut à gauche et se poursuit de gauche à droite de
     * haut en bas.
     * @return le nombre de définitions lues+1
     * @throws IOException
     */
    private int numberCells() throws IOException{
        numbers = new int[nRows][nCols];
        int n=1, nr1=nRows-1, nc1=nCols-1;
        for(int r=0;r<=nr1;r++){
            for(int c=0;c<=nc1;c++){
                if(diagram[r][c]!='.'){
                    if((r<nr1 && diagram[r+1][c]=='-'      // ligne suivante libre
                        && (r==0 || diagram[r-1][c]=='.')) // ligne précédente occupée
                       ||
                       ((c<nc1 && diagram[r][c+1]=='-' // colonne suivante libre
                         && (c==0 || diagram[r][c-1]=='.')))) // colonne précédente occupée
                        numbers[r][c]=n++;
                }
            }
        }
        return n;
    }
    
    /**
     * Lire les définitions selon la notation anglaise en ordre croissant des numéros de case
     * la définiton horizontale (across) arrive avant la verticale (down) lorsqu'il
     * y a deux définitions au même endroit.
     * @param bis flot d'entree
     * @param nDefs nombre de cases numérotées+1
     * @throws IOException
     */
    private void readClues(BufferedInputStream bis,int nDefs) throws IOException{
        clues = new ArrayList<String>();
        puzzleName = readString(bis);
        authorName = readString(bis);
        copyright  = readString(bis);
        acrossClues = new String[nDefs];
        downClues   = new String[nDefs];
        
        String s;
        int nr1=nRows-1,nc1=nCols-1;
        for(int r=0;r<=nr1;r++){
            for(int c=0;c<=nc1;c++){
                if(numbers[r][c]>0){
                    if((c<nc1 && diagram[r][c+1]=='-' // colonne suivante libre
                        && (c==0 || diagram[r][c-1]=='.'))){ //colonne précédente occupée
                        clues.add(s=readString(bis));
                        acrossClues[numbers[r][c]]=s;
                    }
                    if(r<nr1 && diagram[r+1][c]=='-'      // ligne suivante libre
                       && (r==0 || diagram[r-1][c]=='.')){ // ligne précédente occupée
                        clues.add(s=readString(bis));
                        downClues[numbers[r][c]]=s;
                    }
                }
            }
        }
    }
    
    /**
     * Retourne le 
     * @param n  numéro de la définition 
     * @return couple (x,y) correspondant à la position horizontale et verticale
     * de la définition n
     */
    public Point posOf(int n){
        for(int r=0;r<nRows;r++)
            for(int c=0;c<nCols;c++)
                if(numbers[r][c]==n)
                    return new Point(r+1,c+1);
        return null;
    }
    
    
    /**
     * Lecture d'un fichier .puz donné en paramètre
     * Écriture de l'information lue du fichier et création d'un fichier js contenant
     * la version JSON
     * @param args nom d'un fichier en fomat .puz
     */
    public static void main(String[] args){
        try {
            BufferedInputStream bis = new BufferedInputStream(
                                        new FileInputStream(args[0]));
            Puzzle puz = new Puzzle(bis);
            // sortie de la représentation chaîne
            System.out.println(puz);
            // creation de la version js 
            //   nom du fichier est le même que le fichier d'entrée avec js comme extension
            //   au lieu de .puz ou .PUZ en entrée si elle existe
            String jsStream = args[0].replaceAll("(?i)^(.*?)(\\.puz)?$","$1.js");
            PrintStream ps = new PrintStream(jsStream,"UTF-8");
            ps.println("grille = "+puz.toJSON());
            // confirmation de l'écriture du fichier
            System.out.println("*** "+jsStream+" écrit");
            bis.close();
        } catch (IOException e){
            System.out.println("Erreur d'entrée-sortie:"+e);
        }
    }
}            