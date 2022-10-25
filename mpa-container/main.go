package main

import (
	"crypto/md5"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return !os.IsNotExist(err)
}

func isDir(path string) (bool, error) {
	info, err := os.Stat(path)
	if err != nil {
		return false, err
	}
	return info.IsDir(), nil
}

func copyFile(src, dest string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	if err := os.MkdirAll(filepath.Dir(dest), os.ModePerm); err != nil {
		return err
	}
	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()
	if _, err = io.Copy(out, in); err != nil {
		return err
	}
	return nil
}

func fileChecksum(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()
	h := md5.New()
	if _, err := io.Copy(h, file); err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", h.Sum(nil)), nil
}

func mapFolderFiles(folder string) (map[string]string, error) {
	files := make(map[string]string)
	err := filepath.Walk(folder, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			relPath := path[len(folder)+1:]
			files[relPath] = path
		}
		return nil
	})
	return files, err
}

func mapFolderFiles2(files map[string]string, root, folder string) error {
	err := filepath.Walk(filepath.Join(root, folder), func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() {
			// relPath, _ := filepath.Rel(root, path)
			relPath := path[len(root)+1:]
			files[relPath] = path
		}
		return nil
	})
	return err
}

const (
	usage = `usage: %s <source> <target>
Copy web application

Options:
`
)

type arrayFlags []string

func (i *arrayFlags) String() string {
	return "my string representation"
}

func (i *arrayFlags) Set(value string) error {
	*i = append(*i, value)
	return nil
}

func main() {
	assetsVar := flag.String("assets", "static/", "static assets prefix")
	cleanupVar := flag.String("cleanup", "", "directories for cleanup")
	assetsPrefix := *assetsVar
	flag.Usage = func() {
		fmt.Fprintf(flag.CommandLine.Output(), usage, os.Args[0])
		flag.PrintDefaults()
	}

	flag.Parse()

	cleanupDirs := filepath.SplitList(*cleanupVar)
	args := flag.Args()
	if len(args) != 2 {
		flag.Usage()
		os.Exit(1)
	}
	src, _ := filepath.Abs(args[0])
	dest, _ := filepath.Abs(args[1])

	if ok, _ := isDir(src); !ok {
		log.Fatal("Source path is not a directory: ", src)
	}
	if err := os.MkdirAll(dest, os.ModePerm); err != nil {
		log.Fatal("Cannot create destination directory: ", dest)
	}

	srcFiles, err := mapFolderFiles(src)
	if err != nil {
		log.Fatal(err)
	}

	cleanupDirFiles := make(map[string]string)
	for _, dir := range cleanupDirs {
		if err := mapFolderFiles2(cleanupDirFiles, dest, dir); err != nil && !errors.Is(err, os.ErrNotExist) {
			log.Fatalf("cleanup dir error: %v", err)
		}
	}

	// copy new static files first
	for relPath, fullSrcPath := range srcFiles {
		if !strings.HasPrefix(relPath, assetsPrefix) {
			continue
		}
		destFilePath := filepath.Join(dest, relPath)
		if !fileExists(destFilePath) {
			if err = copyFile(fullSrcPath, destFilePath); err != nil {
				log.Fatal(fmt.Sprintf("Faild to copy file: %s", fullSrcPath))
			}
			fmt.Println("Copying:", relPath)
		} else {
			fmt.Println("Skipping:", relPath)
		}
	}

	// update non static files (html, favicon, ...)
	for relPath, fullSrcPath := range srcFiles {
		if !strings.HasPrefix(relPath, assetsPrefix) {
			destPath := filepath.Join(dest, relPath)
			if fileExists(destPath) {
				srcHash, _ := fileChecksum(fullSrcPath)
				destHash, _ := fileChecksum(destPath)
				if srcHash == destHash {
					fmt.Println("Skipping:", relPath)
					continue
				}
			}
			fmt.Println("Copying:", relPath)
			if err = copyFile(fullSrcPath, destPath); err != nil {
				log.Fatal(fmt.Sprintf("Faild to copy file: %s", fullSrcPath))
			}
		}
	}

	obsoleFiles := make(map[string]string)
	for relPath, fullPath := range cleanupDirFiles {
		if _, exist := srcFiles[relPath]; !exist {
			obsoleFiles[relPath] = fullPath
		}
	}
	if len(obsoleFiles) > 0 {
		// give some time to finish downloading of old files
		fmt.Println("## Waiting before removing obsolete files")
		time.Sleep(15 * time.Second)

		// remove obsolete files
		for relPath, fullPath := range obsoleFiles {
			fmt.Println("Removing:", relPath)
			if err = os.Remove(fullPath); err != nil {
				log.Println("Failed to remove obsolete file:", fullPath)
			}
		}
	}
}
