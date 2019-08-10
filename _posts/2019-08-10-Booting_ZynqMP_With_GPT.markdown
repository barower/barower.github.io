---
layout: post
title:  "Booting ZynqMP With GPT"
date:   2019-08-10 12:30:00 +0200
categories: embedded
---
# Booting ZynqMP With GPT

1. Backup original MBR to file
       
    dd if=path_to_device of=MBR.orig count=512 bs=1

2. Find location of your FAT partitions

    fdisk -l path_to_device

  You should see something similar to:

    Device          Start     End Sectors   Size   Type
    path_to_device  2048   135167  133120    65M   Microsoft basic data

3. Temporarily generate MBR entry for your FAT partition (this WILL destroy your MBR, that's why we made backup earlier)

    fdisk -t dos path_to_device
    
 Then:
    
    Welcome to fdisk (util-linux 2.27.1).
    Changes will remain in memory only, until you decide to write them.
    Be careful before using the write command.
    
    Command (m for help): d
    Selected partition 1
    Partition 1 has been deleted
    
    Command (m for help): n
    Partition type
    p   primary (0 primary, 0 extended, 4 free)
    e   extended (container for logical partitions)
    Select (default p): p
    Partition number (1-4, default 1): 1
    First sector (2048-31293439, default 2048): 
    Last sector, +sectors or +size{K,M,G,T,P} (2048-31293439, default 31293439): 135167
    
    Created a new partition 1 of type 'Linux' and of size 65 MiB.
    
    Command (m for help): t     
    Selected partition 1
    Partition type (type L to list all types): L
    
    0  Empty           24  NEC DOS         81  Minix / old Lin bf  Solaris        
    1  FAT12           27  Hidden NTFS Win 82  Linux swap / So c1  DRDOS/sec (FAT-
    2  XENIX root      39  Plan 9          83  Linux           c4  DRDOS/sec (FAT-
    3  XENIX usr       3c  PartitionMagic  84  OS/2 hidden or  c6  DRDOS/sec (FAT-
    4  FAT16 <32M      40  Venix 80286     85  Linux extended  c7  Syrinx         
    5  Extended        41  PPC PReP Boot   86  NTFS volume set da  Non-FS data    
    6  FAT16           42  SFS             87  NTFS volume set db  CP/M / CTOS / .
    7  HPFS/NTFS/exFAT 4d  QNX4.x          88  Linux plaintext de  Dell Utility   
    8  AIX             4e  QNX4.x 2nd part 8e  Linux LVM       df  BootIt         
    9  AIX bootable    4f  QNX4.x 3rd part 93  Amoeba          e1  DOS access     
    a  OS/2 Boot Manag 50  OnTrack DM      94  Amoeba BBT      e3  DOS R/O        
    b  W95 FAT32       51  OnTrack DM6 Aux 9f  BSD/OS          e4  SpeedStor      
    c  W95 FAT32 (LBA) 52  CP/M            a0  IBM Thinkpad hi ea  Rufus alignment
    e  W95 FAT16 (LBA) 53  OnTrack DM6 Aux a5  FreeBSD         eb  BeOS fs        
    f  W95 Ext'd (LBA) 54  OnTrackDM6      a6  OpenBSD         ee  GPT            
    10  OPUS            55  EZ-Drive        a7  NeXTSTEP        ef  EFI (FAT-12/16/
    11  Hidden FAT12    56  Golden Bow      a8  Darwin UFS      f0  Linux/PA-RISC b
    12  Compaq diagnost 5c  Priam Edisk     a9  NetBSD          f1  SpeedStor      
    14  Hidden FAT16 <3 61  SpeedStor       ab  Darwin boot     f4  SpeedStor      
    16  Hidden FAT16    63  GNU HURD or Sys af  HFS / HFS+      f2  DOS secondary  
    17  Hidden HPFS/NTF 64  Novell Netware  b7  BSDI fs         fb  VMware VMFS    
    18  AST SmartSleep  65  Novell Netware  b8  BSDI swap       fc  VMware VMKCORE 
    1b  Hidden W95 FAT3 70  DiskSecure Mult bb  Boot Wizard hid fd  Linux raid auto
    1c  Hidden W95 FAT3 75  PC/IX           bc  Acronis FAT32 L fe  LANstep        
    1e  Hidden W95 FAT1 80  Old Minix       be  Solaris boot    ff  BBT            
    Partition type (type L to list all types): e
    Changed type of partition 'Linux' to 'W95 FAT16 (LBA)'.
    
    Command (m for help): w
    The partition table has been altered.
    Calling ioctl() to re-read partition table.
    Re-reading the partition table failed.: Device or resource busy
    
    The kernel still uses the old table. The new table will be used at the next reboot or after you run partprobe(8) or kpartx(8).
  
### Save new MBR to temporary file

  dd if=path_to_device of=MBR.temp count=512 bs=1

### Move original GPT entry to second entry in temporary MBR

  dd conv=notrunc bs=1 count=16 skip=446 if=MBR.orig of=MBR.temp seek=462

### Move created MBR back to your image

  dd if=MBR.temp of=path_to_device count=512 bs=1
        
