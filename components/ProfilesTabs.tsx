'use client';

import { Tabs, Tab, Button, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useState } from 'react';

interface ProfilesTabsProps {
  selectedProfileId: Id<'profiles'> | undefined;
  onProfileSelect: (id: Id<'profiles'>) => void;
}

export function ProfilesTabs({ selectedProfileId, onProfileSelect }: ProfilesTabsProps) {
  const profiles = useQuery(api.profiles.list);
  const createProfile = useMutation(api.profiles.create);
  const removeProfile = useMutation(api.profiles.remove);
  const setDefault = useMutation(api.profiles.setDefault);
  const [isOpen, setIsOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileColor, setNewProfileColor] = useState('#3B82F6');
  
  const onOpen = () => setIsOpen(true);

  const handleCreateProfile = async () => {
    if (newProfileName.trim()) {
      await createProfile({
        name: newProfileName,
        color: newProfileColor,
      });
      setNewProfileName('');
      setIsOpen(false);
    }
  };

  const handleRemoveProfile = async (id: Id<'profiles'>) => {
    if (confirm('Are you sure you want to remove this profile and all its bookmarks?')) {
      await removeProfile({ profileId: id });
    }
  };

  const handleSetDefault = async (id: Id<'profiles'>) => {
    await setDefault({ profileId: id });
  };

  if (!profiles) return null;

  return (
    <div className="flex items-center gap-2 w-full overflow-x-auto pb-2 border-b border-zinc-100 dark:border-zinc-900">
      <div className="flex-grow">
        <Tabs 
          aria-label="Bookmark Profiles" 
          selectedKey={selectedProfileId} 
          onSelectionChange={(key) => onProfileSelect(key as Id<'profiles'>)}
        >
          <Tabs.List>
            {profiles.map((profile) => (
              <Tab 
                key={profile._id} 
                id={profile._id}
              >
                <div className="flex items-center gap-2 px-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: profile.color }} />
                  {profile.name}
                  <Dropdown>
                    <DropdownTrigger>
                      <button className="ml-1 opacity-20 hover:opacity-100 transition-opacity">▾</button>
                    </DropdownTrigger>
                    <Dropdown.Popover>
                      <Dropdown.Menu aria-label="Profile actions">
                        <Dropdown.Item key="default" onPress={() => handleSetDefault(profile._id)}>
                          Set as Default {profile.isDefault && "(current)"}
                        </Dropdown.Item>
                        <Dropdown.Item key="remove" variant="danger" onPress={() => handleRemoveProfile(profile._id)}>
                          Remove Profile
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown>
                </div>
              </Tab>
            ))}
          </Tabs.List>
        </Tabs>
      </div>
      <Button isIconOnly variant="ghost" onPress={onOpen} className="ml-2">+</Button>

      <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Backdrop />
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>Create New Profile</Modal.Header>
            <Modal.Body>
              <Input 
                placeholder="Work, School, Gaming..." 
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
              <Input 
                type="color"
                value={newProfileColor}
                onChange={(e) => setNewProfileColor(e.target.value)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setIsOpen(false)}>Cancel</Button>
              <Button variant="primary" onPress={handleCreateProfile}>Create</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal>
    </div>
  );
}
